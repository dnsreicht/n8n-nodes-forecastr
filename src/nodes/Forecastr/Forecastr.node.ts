import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeOperationError,
} from "n8n-workflow";

export class Forecastr implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Forecastr",
    name: "forecastr",
    icon: "file:forecastr.svg",
    group: ["transform"],
    version: 1,
    description: "Get verifiable AI forecasts with RFC 3161 timestamps and on-chain proof registry (BYOM or managed inference)",
    defaults: { name: "Forecastr" },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [{ name: "forecastrApi", required: true }],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Forecast",
            value: "forecast",
            description: "Run TimesFM inference on a time series",
            action: "Run a forecast",
          },
          {
            name: "Submit Output",
            value: "submitOutput",
            description: "Submit your own model output for RFC 3161 + on-chain proof (BYOM)",
            action: "Submit model output for proof",
          },
          {
            name: "Verify Hash",
            value: "verifyHash",
            description: "Verify a forecast hash",
            action: "Verify a forecast hash",
          },
          {
            name: "Anchor Claim",
            value: "anchor",
            description: "Anchor a prediction claim with RFC 3161 timestamp",
            action: "Anchor a prediction claim",
          },
        ],
        default: "forecast",
      },
      // Forecast fields
      {
        displayName: "Asset",
        name: "asset",
        type: "string",
        default: "yf_brent",
        required: true,
        displayOptions: { show: { operation: ["forecast", "submitOutput"] } },
        description: "Asset identifier (e.g. yf_brent, aave, yf_gold)",
      },
      {
        displayName: "Horizon (days)",
        name: "horizon",
        type: "number",
        default: 7,
        required: true,
        displayOptions: { show: { operation: ["forecast", "submitOutput"] } },
        description: "Forecast horizon in days (1-256). Free tier: 7d max.",
      },
      {
        displayName: "Values",
        name: "values",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["forecast"] } },
        description: "Comma-separated time series values. Min 32 points.",
        placeholder: "94.1,94.8,95.2,95.0,...",
      },
      // Submit Output fields
      {
        displayName: "Point Forecast",
        name: "pointForecast",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["submitOutput"] } },
        description: "Comma-separated predicted values",
      },
      {
        displayName: "Model ID",
        name: "modelId",
        type: "string",
        default: "my-model-v1",
        displayOptions: { show: { operation: ["submitOutput"] } },
      },
      {
        displayName: "Context Hash",
        name: "contextHash",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["submitOutput"] } },
        description: "SHA-256 hex (64 chars) of the input data your model ran inference on. Required for proof integrity.",
        placeholder: "a3f2...",
      },
      // Verify Hash
      {
        displayName: "Result Hash",
        name: "resultHash",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["verifyHash"] } },
      },
      // Anchor
      {
        displayName: "Claim",
        name: "claim",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["anchor"] } },
        description: "The prediction text (10-2000 chars)",
      },
      {
        displayName: "Due Date",
        name: "dueDate",
        type: "dateTime",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["anchor"] } },
      },
      {
        displayName: "Author",
        name: "author",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { operation: ["anchor"] } },
        placeholder: "@username",
      },
      {
        displayName: "Source",
        name: "source",
        type: "options",
        options: [
          { name: "Manual", value: "manual" },
          { name: "Twitter", value: "twitter" },
        ],
        default: "manual",
        displayOptions: { show: { operation: ["anchor"] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials("forecastrApi");
    const apiKey = credentials.apiKey as string;
    const baseUrl = "https://api.forecastr.dev";
    const headers = { "X-API-Key": apiKey, "Content-Type": "application/json" };

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter("operation", i) as string;

      try {
        let response;

        if (operation === "forecast") {
          const asset = this.getNodeParameter("asset", i) as string;
          const horizon = this.getNodeParameter("horizon", i) as number;
          const valuesStr = this.getNodeParameter("values", i) as string;
          const values = valuesStr.split(",").map((v) => parseFloat(v.trim()));

          response = await this.helpers.httpRequest({
            method: "POST",
            url: `${baseUrl}/forecast`,
            headers,
            body: { asset, horizon, values },
            json: true,
          });

        } else if (operation === "submitOutput") {
          const asset = this.getNodeParameter("asset", i) as string;
          const horizon = this.getNodeParameter("horizon", i) as number;
          const pfStr = this.getNodeParameter("pointForecast", i) as string;
          const modelId = this.getNodeParameter("modelId", i) as string;
          const point_forecast = pfStr.split(",").map((v) => parseFloat(v.trim()));

          const contextHash = this.getNodeParameter("contextHash", i) as string;
          response = await this.helpers.httpRequest({
            method: "POST",
            url: `${baseUrl}/submit-output`,
            headers,
            body: { asset, horizon, point_forecast, payload_type: "forecast", model_id: modelId, context_hash: contextHash },
            json: true,
          });

        } else if (operation === "verifyHash") {
          const resultHash = this.getNodeParameter("resultHash", i) as string;
          response = await this.helpers.httpRequest({
            method: "GET",
            url: `${baseUrl}/verify/hash/${resultHash}`,
            headers,
            json: true,
          });

        } else if (operation === "anchor") {
          const claim = this.getNodeParameter("claim", i) as string;
          const dueDate = this.getNodeParameter("dueDate", i) as string;
          const author = this.getNodeParameter("author", i) as string;
          const source = this.getNodeParameter("source", i) as string;

          response = await this.helpers.httpRequest({
            method: "POST",
            url: `${baseUrl}/anchor`,
            headers,
            body: {
              claim,
              due_date: dueDate.split("T")[0],
              author,
              source,
            },
            json: true,
          });
        }

        returnData.push({ json: response as IDataObject });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      }
    }

    return [returnData];
  }
}