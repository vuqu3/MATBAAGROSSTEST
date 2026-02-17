'use client';

import { useState } from 'react';
import {
  Package,
  Ruler,
  Palette,
  FileText,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ShieldCheck,
  Check,
} from 'lucide-react';

const HIGHLIGHT_ICONS: Record<string, React.ElementType> = {
  Materyal: Package,
  Ebat: Ruler,
  Boyut: Ruler,
  Baskı: Palette,
  Kağıt: FileText,
  Gramaj: FileText,
  Renk: Palette,
};

type ProductAttributeOption = { label: string; priceImpact: number };
type ProductAttribute = { label: string; options: ProductAttributeOption[] };

interface ProductInfoProps {
  name: string;
  category: { name: string; slug: string };
  vendorName: string;
  highlights?: Record<string, string> | null;
  attributes?: ProductAttribute[] | null;
  description?: string | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  /** Teknik özellikler tablosu için: { "Ebat": "25x35 cm", "Kağıt Gramajı": "80 gr", "Materyal": "Kuşe" } */
  specTable?: Record<string, string> | null;
  /** Seçim state'i (kontrollü bileşen) */
  selections: Record<string, ProductAttributeOption>;
  onSelectionChange: (attrLabel: string, option: ProductAttributeOption) => void;
}

export default function ProductInfo({
  name,
  category,
  vendorName,
  highlights = {},
  attributes = [],
  description,
  descriptionDetail,
  specTable,
  selections,
  onSelectionChange,
}: ProductInfoProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const productInfo = descriptionDetail?.productInfo ?? '';
  const extraInfo = descriptionDetail?.extraInfo ?? '';
  const fullDescription = productInfo || description || '';
  const hasMore = !!extraInfo || (fullDescription.length > 400);
  const safeHighlights = highlights && typeof highlights === 'object' ? highlights : {};
  const highlightEntries = Object.entries(safeHighlights).slice(0, 8);
  const specEntries = specTable && typeof specTable === 'object' ? Object.entries(specTable) : [];
  const safeAttributes = Array.isArray(attributes) ? attributes : [];

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
        <span className="text-gray-500">Satıcı:</span>
        <span className="text-[#f97316] font-semibold">{vendorName}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight">
        {name}
      </h1>

      {/* Öne Çıkan Özellikler - ikonlu kutucuklar */}
      {highlightEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {highlightEntries.map(([key, value]) => {
            const Icon = HIGHLIGHT_ICONS[key] ?? Package;
            return (
              <div
                key={key}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
              >
                <Icon className="h-4 w-4 text-[#f97316] flex-shrink-0" />
                <span className="font-medium text-gray-600">{key}:</span>
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Ürün seçenekleri (Ebat, Kağıt vb.) */}
      {safeAttributes.length > 0 && (
        <div className="space-y-3">
          {safeAttributes.map((attr) => (
            <div key={attr.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{attr.label}</label>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((opt) => {
                  const isSelected = selections[attr.label]?.label === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => onSelectionChange(attr.label, opt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-[#f97316] bg-orange-50 text-orange-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                      {opt.label}
                      {opt.priceImpact > 0 && (
                        <span className="text-[#f97316] text-xs">+{opt.priceImpact.toLocaleString('tr-TR')} TL</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ürün Özellikleri Tablosu */}
      {specEntries.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 bg-gray-50 px-4 py-3 border-b border-gray-200">
            Ürün Özellikleri
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {specEntries.map(([label, value], i) => (
                <tr
                  key={label}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">{label}</td>
                  <td className="px-4 py-2.5 text-gray-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ürün açıklaması */}
      {(fullDescription || extraInfo) && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-900 bg-white px-4 py-3 border-b border-gray-200">
            Ürün Bilgisi
          </h2>
          <div className="px-4 py-3">
            <div
              className={`text-gray-600 text-sm leading-relaxed whitespace-pre-wrap ${
                !descriptionExpanded ? 'line-clamp-6' : ''
              }`}
            >
              {fullDescription || 'Açıklama bulunmuyor.'}
              {descriptionExpanded && extraInfo ? '\n\n' + extraInfo : ''}
            </div>
            {hasMore && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((e) => !e)}
                className="mt-3 text-[#f97316] font-medium text-sm inline-flex items-center gap-1 hover:underline"
              >
                {descriptionExpanded ? (
                  <>Daha Az Göster <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Daha Fazla Göster <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ödeme Seçenekleri - güven bloku */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-600" />
          Ödeme Seçenekleri
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Taksit imkanı, havale/EFT ve kredi kartı ile güvenli ödeme.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Güvenli Ödeme
          </span>
          <span className="text-xs text-gray-500">2–12 Taksit</span>
        </div>
      </div>
    </div>
  );
}
