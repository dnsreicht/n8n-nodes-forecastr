import { ICredentialType, INodeProperties } from "n8n-workflow";

export class ForecastrApi implements ICredentialType {
  name = "forecastrApi";
  displayName = "Forecastr API";
  documentationUrl = "https://forecastr.dev/docs.html";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Your Forecastr API key. Get one free at forecastr.dev",
    },
  ];
}
