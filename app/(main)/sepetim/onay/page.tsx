'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  ChevronRight,
  Lock,
  Truck,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
}

interface SavedAddress {
  id: string;
  type: 'BILLING' | 'SHIPPING';
  title: string | null;
  city: string;
  district: string | null;
  line1: string;
  line2: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

interface CardForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export default function OnayPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalAmount, shippingCost, grandTotal, hasFreeShipping, clearCart } = useCart();

  const [addressForm, setAddressForm] = useState<AddressForm>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    district: '',
    address: '',
  });

  const [cardForm, setCardForm] = useState<CardForm>({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Fetch user addresses from database
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user?.id) {
        setAddressesLoading(false);
        return;
      }

      try {
        console.log('CHECKOUT_FETCHING_ADDRESSES');
        const res = await fetch('/api/user/addresses');
        if (res.ok) {
          const data = await res.json();
          console.log('CHECKOUT_ADDRESSES_SUCCESS:', { count: data.length });
          setSavedAddresses(data);
          
          // Auto-select first address if available and no address is selected
          if (data.length > 0 && !selectedAddressId) {
            setSelectedAddressId(data[0].id);
            setShowNewAddressForm(false);
          } else if (data.length === 0) {
            // Show new address form if no saved addresses
            setShowNewAddressForm(true);
            setSelectedAddressId(null);
          }
        } else {
          console.error('CHECKOUT_ADDRESSES_ERROR:', res.status);
        }
      } catch (error) {
        console.error('CHECKOUT_ADDRESSES_CATCH_ERROR:', error);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [session?.user?.id, selectedAddressId]);

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field: keyof CardForm, value: string) => {
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 3);
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);
  };

  const handleNewAddressClick = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    // Reset form
    setAddressForm({
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      district: '',
      address: '',
    });
  };

  const getSelectedAddress = () => {
    if (selectedAddressId) {
      return savedAddresses.find(addr => addr.id === selectedAddressId);
    }
    return null;
  };

  const formatAddressDisplay = (address: SavedAddress) => {
    const parts = [];
    if (address.line1) parts.push(address.line1);
    if (address.line2) parts.push(address.line2);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.join(', ');
  };

  const isAddressValid = () => {
    if (selectedAddressId) {
      // Saved address is always valid
      return true;
    }
    // New address validation
    return (
      addressForm.firstName.trim() &&
      addressForm.lastName.trim() &&
      addressForm.phone.trim() &&
      addressForm.city.trim() &&
      addressForm.district.trim() &&
      addressForm.address.trim()
    );
  };

  const isCardValid =
    cardForm.cardName.trim() &&
    cardForm.cardNumber.replace(/\s/g, '').length === 16 &&
    cardForm.expiry.length === 5 &&
    cardForm.cvv.length === 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddressValid() || !isCardValid || items.length === 0) return;

    setLoading(true);
    setStep('processing');

    try {
      // Get selected address
      const selectedAddress = selectedAddressId ? getSelectedAddress() : null;
      
      if (!selectedAddress && !showNewAddressForm) {
        throw new Error('Lütfen bir teslimat adresi seçin');
      }

      // Prepare order data
      const orderData = {
        addressId: selectedAddressId || '', // Will be validated on backend
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          options: item.options,
          imageUrl: item.imageUrl,
        })),
      };

      console.log('CHECKOUT_SUBMITTING:', { orderData });

      // Create order via API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log('CHECKOUT_SUCCESS:', responseData);
        
        // Clear cart
        clearCart();
        
        // Revalidate orders page to show new order immediately
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/hesabim/siparisler' }),
        }).catch(() => {
          console.warn('Revalidation failed, but order was created');
        });

        setStep('done');

        setTimeout(() => {
          router.push('/siparis-basarili');
        }, 800);
      } else {
        console.error('CHECKOUT_ERROR:', responseData);
        throw new Error(responseData.error || 'Sipariş oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('CHECKOUT_CATCH_ERROR:', error);
      setLoading(false);
      setStep('form');
      
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.';
      alert(errorMessage);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000]/40 focus:border-[#FF6000] transition-colors bg-white';

  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/sepetim"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6000] transition-colors"
          >
            <ArrowLeft size={16} />
            Sepete Dön
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Lock size={14} className="text-green-600" />
            Güvenli Ödeme
          </div>
          {/* Steps */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <span className="text-[#FF6000] font-semibold">Sepet</span>
            <ChevronRight size={12} />
            <span className="text-[#FF6000] font-semibold">Ödeme</span>
            <ChevronRight size={12} />
            <span>Onay</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-[#FF6000]" size={22} />
          Ödeme ve Teslimat
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── SOL: Formlar ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* Teslimat Adresi */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-full bg-[#FF6000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#FF6000]" />
                    <h2 className="font-semibold text-gray-800 text-sm">Teslimat Adresi</h2>
                  </div>
                </div>

                {/* Saved Addresses */}
                <div className="p-5">
                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Adresleriniz yükleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleAddressSelect(address.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              selectedAddressId === address.id
                                ? 'border-orange-500 bg-orange-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-sm text-gray-800">
                                {address.title || 'Adres'}
                              </span>
                              {selectedAddressId === address.id && (
                                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">
                                {address.type === 'BILLING' ? 'Fatura Adresi' : 'Teslimat Adresi'}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {formatAddressDisplay(address)}
                              </p>
                            </div>
                          </button>
                        ))}

                        {/* New Address Button */}
                        <button
                          type="button"
                          onClick={handleNewAddressClick}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            showNewAddressForm
                              ? 'border-orange-500 bg-orange-50 shadow-sm'
                              : 'border-dashed border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center h-full min-h-[100px]">
                            <div className="text-center">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                <MapPin size={18} className="text-gray-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-600">Yeni Adres Ekle</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Selected Address Display */}
                      {selectedAddressId && !showNewAddressForm && (() => {
                        const selectedAddr = getSelectedAddress();
                        return selectedAddr ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-700 text-xs font-semibold mb-2">
                              <CheckCircle size={14} />
                              Seçili Adres: {selectedAddr.title || 'Adres'}
                            </div>
                            <div className="text-xs text-green-600 space-y-0.5">
                              <p><span className="font-medium">Adres:</span> {formatAddressDisplay(selectedAddr)}</p>
                              <p><span className="font-medium">Tip:</span> {selectedAddr.type === 'BILLING' ? 'Fatura Adresi' : 'Teslimat Adresi'}</p>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}

                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-medium text-sm text-gray-800 mb-3">Yeni Adres Bilgileri</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Ad</label>
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Adınız"
                            value={addressForm.firstName}
                            onChange={(e) => handleAddressChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Soyad</label>
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Soyadınız"
                            value={addressForm.lastName}
                            onChange={(e) => handleAddressChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Telefon</label>
                          <input
                            type="tel"
                            className={inputClass}
                            placeholder="05XX XXX XX XX"
                            value={addressForm.phone}
                            onChange={(e) => handleAddressChange('phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>İl</label>
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="İstanbul"
                            value={addressForm.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>İlçe</label>
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Kadıköy"
                            value={addressForm.district}
                            onChange={(e) => handleAddressChange('district', e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Açık Adres</label>
                          <textarea
                            className={inputClass + ' resize-none'}
                            placeholder="Mahalle, sokak, bina no, daire no..."
                            rows={3}
                            value={addressForm.address}
                            onChange={(e) => handleAddressChange('address', e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 text-[#FF6000] border-gray-300 rounded focus:ring-[#FF6000] focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">
                              Bu adresi sonraki alışverişlerim için kaydet
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ödeme Bilgileri */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-full bg-[#FF6000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <CreditCard size={16} className="text-[#FF6000]" />
                    <h2 className="font-semibold text-gray-800 text-sm">Ödeme Bilgileri</h2>
                  </div>
                  {/* Card logos */}
                  <div className="flex items-center gap-2">
                    <div className="bg-[#1A1F71] text-white text-[9px] font-black px-2 py-0.5 rounded tracking-wider">
                      VISA
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
                      <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 -ml-2" />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Card preview strip */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-xs text-gray-400 uppercase tracking-widest">Kredi Kartı</div>
                        <div className="flex items-center gap-0.5">
                          <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-80" />
                          <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-80 -ml-2" />
                        </div>
                      </div>
                      <div className="text-lg font-mono tracking-widest mb-3 text-gray-100">
                        {cardForm.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Kart Sahibi</div>
                          <div className="text-sm font-medium text-gray-200 uppercase">
                            {cardForm.cardName || 'AD SOYAD'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Son Kullanma</div>
                          <div className="text-sm font-medium text-gray-200">
                            {cardForm.expiry || 'AA/YY'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Kart Üzerindeki İsim</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="AD SOYAD"
                        value={cardForm.cardName}
                        onChange={(e) => handleCardChange('cardName', e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Kart Numarası</label>
                      <input
                        type="text"
                        className={inputClass + ' font-mono tracking-widest'}
                        placeholder="0000 0000 0000 0000"
                        value={cardForm.cardNumber}
                        onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                        maxLength={19}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Son Kullanma Tarihi</label>
                      <input
                        type="text"
                        className={inputClass + ' font-mono'}
                        placeholder="AA/YY"
                        value={cardForm.expiry}
                        onChange={(e) => handleCardChange('expiry', e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>CVV</label>
                      <div className="relative">
                        <input
                          type="password"
                          className={inputClass + ' font-mono'}
                          placeholder="•••"
                          value={cardForm.cvv}
                          onChange={(e) => handleCardChange('cvv', e.target.value)}
                          maxLength={3}
                          required
                        />
                        <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <Lock size={13} className="text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-700">
                      Kart bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Bilgileriniz hiçbir şekilde saklanmaz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SAĞ: Sipariş Özeti ── */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-20">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <ShoppingBag size={16} className="text-[#FF6000]" />
                  <h2 className="font-semibold text-gray-800 text-sm">Sipariş Özeti</h2>
                  <span className="ml-auto text-xs text-gray-400">{items.length} ürün</span>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div key={item.lineId} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          {item.imageUrl && !item.imageUrl.includes('placeholder') ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              <ShoppingBag size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">x{item.quantity}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                          {item.totalPrice.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">Sepetiniz boş</p>
                  )}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ara Toplam</span>
                    <span className="font-medium">{totalAmount.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Truck size={13} className="text-gray-400" />
                      Kargo
                    </span>
                    {hasFreeShipping ? (
                      <span className="text-green-600 font-semibold text-xs">ÜCRETSİZ</span>
                    ) : (
                      <span className="font-medium">{shippingCost.toLocaleString('tr-TR')} TL</span>
                    )}
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between">
                    <span className="font-bold text-gray-900">Toplam</span>
                    <span className="font-bold text-[#FF6000] text-lg">
                      {grandTotal.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={loading || items.length === 0 || !isAddressValid() || !isCardValid}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
                      bg-gradient-to-r from-[#FF6000] to-[#ea580c]
                      hover:from-[#ea580c] hover:to-[#c2410c]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-lg shadow-orange-200
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        İşleniyor...
                      </>
                    ) : step === 'done' ? (
                      <>
                        <CheckCircle size={18} />
                        Ödeme Başarılı!
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Ödemeyi Tamamla — {grandTotal.toLocaleString('tr-TR')} TL
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Lock size={10} />
                    256-bit SSL ile güvenli ödeme
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
