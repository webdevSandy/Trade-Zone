export interface StockMetadata {
  symbol: string;
  companyName: string;
  domain?: string;
  logoColor?: string;
}

export const STOCK_METADATA: StockMetadata[] = [
  { symbol: "RELIANCE", companyName: "Reliance Industries Ltd", domain: "relianceindustries.com", logoColor: "#1A73E8" },
  { symbol: "TCS", companyName: "Tata Consultancy Services", domain: "tcs.com", logoColor: "#0D47A1" },
  { symbol: "HDFCBANK", companyName: "HDFC Bank Ltd", domain: "hdfcbank.com", logoColor: "#0066B3" },
  { symbol: "INFY", companyName: "Infosys Ltd", domain: "infosys.com", logoColor: "#FF9800" },
  { symbol: "ICICIBANK", companyName: "ICICI Bank Ltd", domain: "icicibank.com", logoColor: "#0288D1" },
  { symbol: "HINDUNILVR", companyName: "Hindustan Unilever Ltd", domain: "hul.co.in", logoColor: "#1565C0" },
  { symbol: "ITC", companyName: "ITC Ltd", domain: "itcportal.com", logoColor: "#3F51B5" },
  { symbol: "SBIN", companyName: "State Bank of India", domain: "sbi.co.in", logoColor: "#00a1e4" },
  { symbol: "BHARTIARTL", companyName: "Bharti Airtel Ltd", domain: "airtel.in", logoColor: "#E53935" },
  { symbol: "KOTAKBANK", companyName: "Kotak Mahindra Bank", domain: "kotak.com", logoColor: "#E53935" },
  { symbol: "LT", companyName: "Larsen & Tourbro Ltd", domain: "larsentoubro.com", logoColor: "#FBC02D" },
  { symbol: "AXISBANK", companyName: "Axis Bank Ltd", domain: "axisbank.com", logoColor: "#880E4F" },
  { symbol: "WIPRO", companyName: "Wipro Ltd", domain: "wipro.com", logoColor: "#7B1FA2" },
  { symbol: "ASIANPAINT", companyName: "Asian Paints Ltd", domain: "asianpaints.com", logoColor: "#E040FB" },
  { symbol: "MARUTI", companyName: "Maruti Suzuki India", domain: "marutisuzuki.com", logoColor: "#0D47A1" },
  { symbol: "TATAMOTORS", companyName: "Tata Motors Ltd", domain: "tatamotors.com", logoColor: "#0288D1" },
  { symbol: "SUNPHARMA", companyName: "Sun Pharmaceutical", domain: "sunpharma.com", logoColor: "#E65100" },
  { symbol: "BAJFINANCE", companyName: "Bajaj Finance Ltd", domain: "bajajfinserv.in", logoColor: "#0D47A1" },
  { symbol: "TITAN", companyName: "Titan Company Ltd", domain: "titan.co.in", logoColor: "#F57F17" },
  { symbol: "ULTRACEMCO", companyName: "UltraTech Cement Ltd", domain: "ultratechcement.com", logoColor: "#FF6F00" },
  { symbol: "POWERGRID", companyName: "Power Grid Corp", domain: "powergrid.in", logoColor: "#2E7D32" },
  { symbol: "NTPC", companyName: "NTPC Ltd", domain: "ntpc.co.in", logoColor: "#1565C0" },
  { symbol: "TATASTEEL", companyName: "Tata Steel Ltd", domain: "tatasteel.com", logoColor: "#0288D1" },
  { symbol: "HCLTECH", companyName: "HCL Technologies Ltd", domain: "hcltech.com", logoColor: "#0D47A1" },
  { symbol: "ADANIENT", companyName: "Adani Enterprises Ltd", domain: "adani.com", logoColor: "#37474F" },
  { symbol: "ONGC", companyName: "Oil & Natural Gas Corp", domain: "ongcindia.com", logoColor: "#C62828" },
  { symbol: "COALINDIA", companyName: "Coal India Ltd", domain: "coalindia.in", logoColor: "#4E342E" },
  { symbol: "JSWSTEEL", companyName: "JSW Steel Ltd", domain: "jsw.in", logoColor: "#1565C0" },
  { symbol: "TECHM", companyName: "Tech Mahindra Ltd", domain: "techmahindra.com", logoColor: "#E53935" },
  { symbol: "DRREDDY", companyName: "Dr. Reddy's Laboratories", domain: "drreddys.com", logoColor: "#2E7D32" },
  { symbol: "TATAPOWER", companyName: "Tata Power Company", domain: "tatapower.com", logoColor: "#0288D1" },
  { symbol: "SUZLON", companyName: "Suzlon Energy Ltd", domain: "suzlon.com", logoColor: "#2E7D32" },
  { symbol: "IRFC", companyName: "Indian Railway Finance Corp", domain: "irfc.co.in", logoColor: "#F57F17" },
  { symbol: "NHPC", companyName: "NHPC Limited", domain: "nhpcindia.com", logoColor: "#1565C0" },
  { symbol: "YESBANK", companyName: "Yes Bank Limited", domain: "yesbank.in", logoColor: "#0D47A1" },
  { symbol: "IDEA", companyName: "Vodafone Idea Ltd", domain: "myvi.in", logoColor: "#E53935" },
  { symbol: "ETERNAL", companyName: "Eternal (Zomato)", domain: "zomato.com", logoColor: "#CB202D" },
  { symbol: "PAYTM", companyName: "One97 Communications (Paytm)", domain: "paytm.com", logoColor: "#00baf2" },
  // Extra Tata instruments from user Groww search screenshot
  { symbol: "TATAGOLD", companyName: "Tata Gold Exchange Traded Fund", domain: "tatamutualfund.com", logoColor: "#E53935" },
  { symbol: "TATSILV", companyName: "Tata Silver Exchange Traded Fund", domain: "tatamutualfund.com", logoColor: "#757575" },
  { symbol: "TMPV", companyName: "Tata Motors Passenger Vehicles Ltd", domain: "tatamotors.com", logoColor: "#0288D1" },
];
