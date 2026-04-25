/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClimateData {
  climate_zone: string;
  soil_type_estimation: string;
  rainfall_pattern: string;
  temperature_range: string;
}

export const getAnalysis = async (location: string, month: string): Promise<{ climate: ClimateData; recommendations: string }> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, month }),
  });
  if (!response.ok) throw new Error("Failed to analyze");
  return response.json();
};

export const getInsight = async (type: string, data: any): Promise<string> => {
  const response = await fetch("/api/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  });
  if (!response.ok) throw new Error("Failed to get insight");
  const result = await response.json();
  return result.content;
};
