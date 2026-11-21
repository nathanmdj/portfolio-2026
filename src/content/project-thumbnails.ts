import type { StaticImageData } from "next/image";
import govContractDiscovery from "@/assets/projects/gov-contract-discovery.png";
import pisoWifiVending from "@/assets/projects/piso-wifi-vending.png";
import quantTradingPlatform from "@/assets/projects/quant-trading-platform.jpg";
import regulatoryIntelligenceApi from "@/assets/projects/regulatory-intelligence-api.png";

/**
 * Card thumbnails, keyed by project slug. Kept out of profile.ts because that
 * file is serialized into the assistant's prompt and image paths aren't facts.
 * Projects missing here render a placeholder tile instead.
 */
export const projectThumbnails: Readonly<Record<string, StaticImageData>> = {
  "gov-contract-discovery": govContractDiscovery,
  "piso-wifi-vending": pisoWifiVending,
  "quant-trading-platform": quantTradingPlatform,
  "regulatory-intelligence-api": regulatoryIntelligenceApi,
};
