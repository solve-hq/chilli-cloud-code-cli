const axios = require("axios");
const axiosDebug = require("axios-debug-log");
const chilliLogger = require("debug")("chilli");

class ChilliClient {
  constructor(apiToken, apiSecret, gameToken) {
    this.httpClient = axios.create({
      baseURL: `https://adminapi.chilliconnect.com/game/${gameToken}`,
      timeout: 3000,
      headers: {
        "Api-Token": apiToken,
        "Api-Secret": apiSecret,
        "Api-Version": "1.2.0",
        "Content-Type": "application/json",
      },
    });

    axiosDebug.addLogger(this.httpClient, chilliLogger);
  }

  async getScriptDetails(key) {
    try {
      const response = await this.httpClient.get(`/script/${key}`);

      return response.data;
    } catch (error) {
      // 401 means the script does not exist
      if (error.response.status !== 401) {
        throw error;
      }
    }
  }

  async createScript(options) {
    const response = await this.httpClient.post("/script", options);

    return response.data;
  }

  async updateScript(key, options) {
    const response = await this.httpClient.post(`/script/${key}`, options);

    return response.data;
  }

  async publishScript(key) {
    const response = await this.httpClient.post(`/script/${key}/publish`);

    return response.data;
  }

  async testRunScript(key, options) {
    chilliLogger(`Running script with options %o`, options);

    const response = await this.httpClient.post(`/script/${key}/run`, options);

    return response.data;
  }
}

module.exports = ChilliClient;
