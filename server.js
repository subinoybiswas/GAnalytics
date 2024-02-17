import express from "express";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import 'dotenv/config'
const app = express();
const port = 3000;

app.post("/", async (req, res) => {
  try {
    const propertyId = process.env.PROPERTY_ID;
    const analyticsDataClient = new BetaAnalyticsDataClient({
      auth: new GoogleAuth({
        projectId: "subinoy-382420",
        scopes: "https://www.googleapis.com/auth/analytics",
        credentials: {
          client_email: process.env.CLIENT_EMAIL,
          private_key: process.env.PRIVATE_KEY.split(/\\n/).join("\n"),
        },
      }),
    });
    if (!propertyId || !analyticsDataClient) {
      throw "ENV ERROR";
    }
    const resp = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "2023-01-21",
          endDate: "today",
        },
      ],
      metrics: [
        {
          name: "totalUsers",
        },
        {
          name: "averageSessionDuration",
        },
        {
          name: "active7DayUsers",
        },
        // Add more metrics as needed
      ],
    });
    const response = resp;
    const metricHeaders = response[0].metricHeaders;
    const metricValues = response[0].rows[0].metricValues;

    // Find the index of the "activeUsers" metric:
    const metricData = metricHeaders.map((header, index) => ({
      fieldName: header.name,
      value: metricValues[index].value,
    }));
    res.status(200).json({ metricData });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
