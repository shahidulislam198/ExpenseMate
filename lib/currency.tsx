import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ── Currency definitions ───────────────────────────────────────

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "ALL", symbol: "L", name: "Albanian Lek" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble" },
  { code: "BOB", symbol: "Bs.", name: "Bolivian Boliviano" },
  { code: "BAM", symbol: "KM", name: "Bosnia-Herzegovina Mark" },
  { code: "BWP", symbol: "P", name: "Botswana Pula" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "COP", symbol: "CO$", name: "Colombian Peso" },
  { code: "CDF", symbol: "FC", name: "Congolese Franc" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal" },
  { code: "GNF", symbol: "FG", name: "Guinean Franc" },
  { code: "HTG", symbol: "G", name: "Haitian Gourde" },
  { code: "HNL", symbol: "L", name: "Honduran Lempira" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "IRR", symbol: "﷼", name: "Iranian Rial" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar" },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "KWD", symbol: "KD", name: "Kuwaiti Dinar" },
  { code: "LAK", symbol: "₭", name: "Lao Kip" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
  { code: "LYD", symbol: "ل.د", name: "Libyan Dinar" },
  { code: "MOP", symbol: "MOP$", name: "Macanese Pataca" },
  { code: "MKD", symbol: "ден", name: "Macedonian Denar" },
  { code: "MGA", symbol: "Ar", name: "Malagasy Ariary" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "MUR", symbol: "₨", name: "Mauritian Rupee" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu" },
  { code: "MNT", symbol: "₮", name: "Mongolian Tögrög" },
  { code: "MAD", symbol: "DH", name: "Moroccan Dirham" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat" },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar" },
  { code: "NPR", symbol: "रू", name: "Nepalese Rupee" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa" },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina" },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní" },
  { code: "PEN", symbol: "S/.", name: "Peruvian Sol" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "RSD", symbol: "дин.", name: "Serbian Dinar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SOS", symbol: "Sh.So.", name: "Somali Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SYP", symbol: "£S", name: "Syrian Pound" },
  { code: "TWD", symbol: "NT$", name: "Taiwan New Dollar" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TTD", symbol: "TT$", name: "Trinidad & Tobago Dollar" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso" },
  { code: "UZS", symbol: "so'm", name: "Uzbekistani Som" },
  { code: "VES", symbol: "Bs.S", name: "Venezuelan Bolívar" },
  { code: "VND", symbol: "₫", name: "Vietnamese Đồng" },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
];

const STORAGE_KEY = "@newwww_currency";
const SET_FLAG_KEY = "@newwww_currency_set";

// ── Context ────────────────────────────────────────────────────

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => Promise<void>;
  isLoaded: boolean;
  hasSetCurrency: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrencyCode: async () => {},
  isLoaded: false,
  hasSetCurrency: false,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

// ── Provider ───────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(CURRENCIES[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSetCurrency, setHasSetCurrency] = useState(false);

  // Load saved currency on mount
  useEffect(() => {
    (async () => {
      try {
        const [saved, flag] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(SET_FLAG_KEY),
        ]);
        if (saved) {
          const found = CURRENCIES.find((c) => c.code === saved);
          if (found) setCurrency(found);
        }
        if (flag === "1") setHasSetCurrency(true);
      } catch (e) {
        console.error("Failed to load currency:", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setCurrencyCode = useCallback(async (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    setCurrency(found);
    setHasSetCurrency(true);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, code),
      AsyncStorage.setItem(SET_FLAG_KEY, "1"),
    ]);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, isLoaded, hasSetCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// ── Helper: format amount with currency symbol ─────────────────

export function formatCurrency(amount: number, symbol: string): string {
  const abs = Math.abs(amount);
  // Format with 2 decimals, but remove trailing zeros for cleaner look
  const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
  return `${symbol}${formatted}`;
}
