// ─── Upstox Instrument Key Mappings ─────────────────────────────────────────────
// Format: "EXCHANGE_SEGMENT|ISIN" or "EXCHANGE_INDEX|IndexName"
// These are used to query the Upstox API for market quotes.

// ─── Market Indices ─────────────────────────────────────────────────────────────

export const INDEX_INSTRUMENTS: Record<string, string> = {
  NIFTY: "NSE_INDEX|Nifty 50",
  SENSEX: "BSE_INDEX|SENSEX",
  BANKNIFTY: "NSE_INDEX|Nifty Bank",
  MIDCPNIFTY: "NSE_INDEX|NIFTY MID SELECT",
  FINNIFTY: "NSE_INDEX|Nifty Fin Service",
};

// ─── NIFTY 50 + Popular Stocks ──────────────────────────────────────────────────

export const STOCK_INSTRUMENTS: Record<string, { instrumentKey: string; companyName: string; domain?: string; logoColor?: string }> = {
  RELIANCE: { instrumentKey: "NSE_EQ|INE002A01018", companyName: "Reliance Industries Ltd", domain: "relianceindustries.com", logoColor: "#1A73E8" },
  TCS: { instrumentKey: "NSE_EQ|INE467B01029", companyName: "Tata Consultancy Services", domain: "tcs.com", logoColor: "#0D47A1" },
  HDFCBANK: { instrumentKey: "NSE_EQ|INE040A01034", companyName: "HDFC Bank Ltd", domain: "hdfcbank.com", logoColor: "#0066B3" },
  INFY: { instrumentKey: "NSE_EQ|INE009A01021", companyName: "Infosys Ltd", domain: "infosys.com", logoColor: "#FF9800" },
  ICICIBANK: { instrumentKey: "NSE_EQ|INE090A01021", companyName: "ICICI Bank Ltd", domain: "icicibank.com", logoColor: "#0288D1" },
  HINDUNILVR: { instrumentKey: "NSE_EQ|INE030A01027", companyName: "Hindustan Unilever Ltd", domain: "hul.co.in", logoColor: "#1565C0" },
  ITC: { instrumentKey: "NSE_EQ|INE154A01025", companyName: "ITC Ltd", domain: "itcportal.com", logoColor: "#3F51B5" },
  SBIN: { instrumentKey: "NSE_EQ|INE062A01020", companyName: "State Bank of India", domain: "sbi.co.in", logoColor: "#00a1e4" },
  BHARTIARTL: { instrumentKey: "NSE_EQ|INE397D01024", companyName: "Bharti Airtel Ltd", domain: "airtel.in", logoColor: "#E53935" },
  KOTAKBANK: { instrumentKey: "NSE_EQ|INE237A01028", companyName: "Kotak Mahindra Bank", domain: "kotak.com", logoColor: "#E53935" },
  LT: { instrumentKey: "NSE_EQ|INE018A01030", companyName: "Larsen & Tourbro Ltd", domain: "larsentoubro.com", logoColor: "#FBC02D" },
  AXISBANK: { instrumentKey: "NSE_EQ|INE238A01034", companyName: "Axis Bank Ltd", domain: "axisbank.com", logoColor: "#880E4F" },
  WIPRO: { instrumentKey: "NSE_EQ|INE075A01022", companyName: "Wipro Ltd", domain: "wipro.com", logoColor: "#7B1FA2" },
  ASIANPAINT: { instrumentKey: "NSE_EQ|INE021A01026", companyName: "Asian Paints Ltd", domain: "asianpaints.com", logoColor: "#E040FB" },
  MARUTI: { instrumentKey: "NSE_EQ|INE585B01010", companyName: "Maruti Suzuki India", domain: "marutisuzuki.com", logoColor: "#0D47A1" },
  TATAMOTORS: { instrumentKey: "NSE_EQ|INE155A01022", companyName: "Tata Motors Ltd", domain: "tatamotors.com", logoColor: "#0288D1" },
  SUNPHARMA: { instrumentKey: "NSE_EQ|INE044A01036", companyName: "Sun Pharmaceutical", domain: "sunpharma.com", logoColor: "#E65100" },
  BAJFINANCE: { instrumentKey: "NSE_EQ|INE296A01024", companyName: "Bajaj Finance Ltd", domain: "bajajfinserv.in", logoColor: "#0D47A1" },
  TITAN: { instrumentKey: "NSE_EQ|INE280A01028", companyName: "Titan Company Ltd", domain: "titan.co.in", logoColor: "#F57F17" },
  ULTRACEMCO: { instrumentKey: "NSE_EQ|INE481G01011", companyName: "UltraTech Cement Ltd", domain: "ultratechcement.com", logoColor: "#FF6F00" },
  POWERGRID: { instrumentKey: "NSE_EQ|INE752E01010", companyName: "Power Grid Corp", domain: "powergrid.in", logoColor: "#2E7D32" },
  NTPC: { instrumentKey: "NSE_EQ|INE733E01010", companyName: "NTPC Ltd", domain: "ntpc.co.in", logoColor: "#1565C0" },
  TATASTEEL: { instrumentKey: "NSE_EQ|INE081A01020", companyName: "Tata Steel Ltd", domain: "tatasteel.com", logoColor: "#0288D1" },
  HCLTECH: { instrumentKey: "NSE_EQ|INE860A01027", companyName: "HCL Technologies Ltd", domain: "hcltech.com", logoColor: "#0D47A1" },
  ADANIENT: { instrumentKey: "NSE_EQ|INE423A01024", companyName: "Adani Enterprises Ltd", domain: "adani.com", logoColor: "#37474F" },
  ONGC: { instrumentKey: "NSE_EQ|INE213A01029", companyName: "Oil & Natural Gas Corp", domain: "ongcindia.com", logoColor: "#C62828" },
  COALINDIA: { instrumentKey: "NSE_EQ|INE522F01014", companyName: "Coal India Ltd", domain: "coalindia.in", logoColor: "#4E342E" },
  JSWSTEEL: { instrumentKey: "NSE_EQ|INE019A01038", companyName: "JSW Steel Ltd", domain: "jsw.in", logoColor: "#1565C0" },
  TECHM: { instrumentKey: "NSE_EQ|INE669C01036", companyName: "Tech Mahindra Ltd", domain: "techmahindra.com", logoColor: "#E53935" },
  DRREDDY: { instrumentKey: "NSE_EQ|INE089A01023", companyName: "Dr. Reddy's Laboratories", domain: "drreddys.com", logoColor: "#2E7D32" },
  // Stocks from current mock data
  TATAPOWER: { instrumentKey: "NSE_EQ|INE245A01021", companyName: "Tata Power Company", domain: "tatapower.com", logoColor: "#0288D1" },
  SUZLON: { instrumentKey: "NSE_EQ|INE040H01021", companyName: "Suzlon Energy Ltd", domain: "suzlon.com", logoColor: "#2E7D32" },
  IRFC: { instrumentKey: "NSE_EQ|INE053F01010", companyName: "Indian Railway Finance Corp", domain: "irfc.co.in", logoColor: "#F57F17" },
  NHPC: { instrumentKey: "NSE_EQ|INE848E01016", companyName: "NHPC Limited", domain: "nhpcindia.com", logoColor: "#1565C0" },
  YESBANK: { instrumentKey: "NSE_EQ|INE528G01035", companyName: "Yes Bank Limited", domain: "yesbank.in", logoColor: "#0D47A1" },
  IDEA: { instrumentKey: "NSE_EQ|INE669E01016", companyName: "Vodafone Idea Ltd", domain: "myvi.in", logoColor: "#E53935" },
  ETERNAL: { instrumentKey: "NSE_EQ|INE758T01015", companyName: "Eternal (Zomato)", domain: "zomato.com", logoColor: "#CB202D" },
  PAYTM: { instrumentKey: "NSE_EQ|INE982J01020", companyName: "One97 Communications (Paytm)", domain: "paytm.com", logoColor: "#00baf2" },
  TATAGOLD: { instrumentKey: "NSE_EQ|INE00YV01019", companyName: "Tata Gold Exchange Traded Fund", domain: "tatamutualfund.com", logoColor: "#E53935" },
  TATSILV: { instrumentKey: "NSE_EQ|TATSILV", companyName: "Tata Silver Exchange Traded Fund", domain: "tatamutualfund.com", logoColor: "#757575" },
  TMPV: { instrumentKey: "NSE_EQ|TMPV", companyName: "Tata Motors Passenger Vehicles Ltd", domain: "tatamotors.com", logoColor: "#0288D1" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

export const getAllStockInstrumentKeys = (): string[] => {
  return Object.values(STOCK_INSTRUMENTS).map((s) => s.instrumentKey);
};

export const getAllIndexInstrumentKeys = (): string[] => {
  return Object.values(INDEX_INSTRUMENTS);
};

export const getSymbolFromInstrumentKey = (instrumentKey: string): string | undefined => {
  // Try direct match first
  for (const [symbol, data] of Object.entries(STOCK_INSTRUMENTS)) {
    if (data.instrumentKey === instrumentKey) return symbol;
  }
  for (const [name, key] of Object.entries(INDEX_INSTRUMENTS)) {
    if (key === instrumentKey) return name;
  }

  // Normalize colon format (e.g. "NSE_INDEX:Nifty 50" -> "NSE_INDEX|Nifty 50")
  const normalizedKey = instrumentKey.replace(":", "|");

  // Check stocks by normalized key
  for (const [symbol, data] of Object.entries(STOCK_INSTRUMENTS)) {
    if (data.instrumentKey === normalizedKey) return symbol;
  }

  // Check indices by normalized key
  for (const [name, key] of Object.entries(INDEX_INSTRUMENTS)) {
    if (key === normalizedKey) return name;
  }

  // Extract symbol directly for cases like "NSE_EQ:LT" where segment is NSE_EQ and symbol is LT
  if (instrumentKey.includes(":")) {
    const parts = instrumentKey.split(":");
    const symbolOrName = parts[1]?.toUpperCase();
    if (symbolOrName) {
      return symbolOrName;
    }
  }

  return undefined;
};

