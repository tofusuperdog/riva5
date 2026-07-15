/**
 * Labels for economy dropdowns.
 *
 * Country ISO-3 codes are translated with Intl.DisplayNames. When adding a
 * new country from the API, add its ISO-3 → ISO-2 entry below; non-ISO entries
 * (headers and economy groups) belong in economyTranslations.
 */
export const economyTranslations = {
  "en-US": {
    "-": ["Individual Economies", "Economy Groups"],
    APEC: "APEC", APTA: "APTA", AP: "Asia-Pacific", BIMSTEC: "BIMSTEC", CPTPP: "CPTPP",
    ENEA: "East and North-East Asia", EUR: "Europe", EUZ: "European Union", FEALAC: "FEALAC",
    LAC: "Latin America and the Caribbean", MERCOSUR: "MERCOSUR", NOAME: "North America",
    NCA: "North and Central Asia", PAC: "Pacific", PAC_ALLIANCE: "Pacific Alliance", RCEP: "RCEP",
    SAARC: "SAARC", SSWA: "South and South-West Asia", SEA: "South-East Asia", USMCA: "USMCA", WLD: "World",
  },
  "zh-CN": {
    "-": ["单个经济体", "经济体组"],
    APEC: "亚太经合组织", APTA: "亚太贸易协定", AP: "亚太地区", BIMSTEC: "环孟加拉湾多领域技术和经济合作倡议", CPTPP: "全面与进步跨太平洋伙伴关系协定",
    ENEA: "东北亚", EUR: "欧洲", EUZ: "欧洲联盟", FEALAC: "东亚—拉丁美洲合作论坛", LAC: "拉丁美洲和加勒比地区", MERCOSUR: "南方共同市场",
    NOAME: "北美", NCA: "北亚和中亚", PAC: "太平洋", PAC_ALLIANCE: "太平洋联盟", RCEP: "区域全面经济伙伴关系", SAARC: "南亚区域合作联盟",
    SSWA: "南亚和西南亚", SEA: "东南亚", USMCA: "美墨加协定", WLD: "世界",
  },
  "ru-RU": {
    "-": ["Отдельные экономики", "Группы экономик"],
    APEC: "АТЭС", APTA: "Азиатско-Тихоокеанское торговое соглашение", AP: "Азиатско-Тихоокеанский регион", BIMSTEC: "БИМСТЕК", CPTPP: "ВПТТП",
    ENEA: "Северо-Восточная Азия", EUR: "Европа", EUZ: "Европейский союз", FEALAC: "Форум Восточная Азия — Латинская Америка", LAC: "Латинская Америка и Карибский бассейн", MERCOSUR: "МЕРКОСУР",
    NOAME: "Северная Америка", NCA: "Северная и Центральная Азия", PAC: "Тихоокеанский регион", PAC_ALLIANCE: "Тихоокеанский альянс", RCEP: "ВРЭП", SAARC: "СААРК",
    SSWA: "Южная и Юго-Западная Азия", SEA: "Юго-Восточная Азия", USMCA: "Соглашение США—Мексика—Канада", WLD: "Мир",
  },
  "fr-FR": {
    "-": ["Économies individuelles", "Groupes d’économies"],
    APEC: "APEC", APTA: "Accord commercial Asie-Pacifique", AP: "Asie-Pacifique", BIMSTEC: "BIMSTEC", CPTPP: "PTPGP",
    ENEA: "Asie du Nord-Est", EUR: "Europe", EUZ: "Union européenne", FEALAC: "Forum de coopération Asie de l’Est—Amérique latine", LAC: "Amérique latine et Caraïbes", MERCOSUR: "MERCOSUR",
    NOAME: "Amérique du Nord", NCA: "Asie du Nord et Asie centrale", PAC: "Pacifique", PAC_ALLIANCE: "Alliance du Pacifique", RCEP: "RCEP", SAARC: "ASACR",
    SSWA: "Asie du Sud et du Sud-Ouest", SEA: "Asie du Sud-Est", USMCA: "Accord Canada—États-Unis—Mexique", WLD: "Monde",
  },
};

const displayNames = new Map();
const alpha3ToAlpha2 = {
  ARG: "AR", ARM: "AM", AUS: "AU", AUT: "AT", BGD: "BD", BEL: "BE", BTN: "BT", BRA: "BR", BRN: "BN", BGR: "BG", KHM: "KH", CAN: "CA", CHL: "CL", CHN: "CN", COL: "CO", HRV: "HR", CYP: "CY", CZE: "CZ", DNK: "DK", ECU: "EC", EGY: "EG", EST: "EE", FJI: "FJ", FIN: "FI", FRA: "FR", GEO: "GE", DEU: "DE", GRC: "GR", HKG: "HK", HUN: "HU", IND: "IN", IDN: "ID", IRL: "IE", ITA: "IT", JPN: "JP", KAZ: "KZ", KWT: "KW", KGZ: "KG", LAO: "LA", LVA: "LV", LBN: "LB", LTU: "LT", LUX: "LU", MYS: "MY", MDV: "MV", MLT: "MT", MEX: "MX", MNG: "MN", NPL: "NP", NLD: "NL", NZL: "NZ", NOR: "NO", PAK: "PK", PHL: "PH", POL: "PL", PRT: "PT", KOR: "KR", ROU: "RO", RUS: "RU", SAU: "SA", SGP: "SG", SVK: "SK", SVN: "SI", ESP: "ES", LKA: "LK", SWE: "SE", CHE: "CH", TWN: "TW", TJK: "TJ", THA: "TH", USA: "US", TUR: "TR", ARE: "AE", GBR: "GB", UZB: "UZ", VNM: "VN",
};
const getDisplayNames = (locale) => {
  if (!displayNames.has(locale)) {
    displayNames.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
  }
  return displayNames.get(locale);
};

/** Returns a translated label while preserving the API label as a safe fallback. */
export const translateEconomy = ({ iso, name }, locale = "en-US", headerIndex = 0) => {
  const translations = economyTranslations[locale] || economyTranslations["en-US"];
  const translated = translations[iso];
  if (Array.isArray(translated)) return translated[headerIndex] || name;
  if (translated) return translated;

  try {
    return getDisplayNames(locale).of(alpha3ToAlpha2[iso]) || name;
  } catch {
    return name;
  }
};

/** Returns a translated economy-region/group label from the API's English label. */
export const translateEconomyGroup = (name, locale = "en-US") => {
  if (!name) return "";

  const normalizedName = String(name).trim().toLowerCase();
  const code = Object.entries(economyTranslations["en-US"]).find(
    ([, label]) => typeof label === "string" && label.toLowerCase() === normalizedName,
  )?.[0];

  if (!code) return name;
  return economyTranslations[locale]?.[code] || economyTranslations["en-US"]?.[code] || name;
};
