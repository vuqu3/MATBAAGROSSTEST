'use client';

import { useEffect, useMemo } from 'react';

type PaytrTaksitTablosuProps = {
  price: number;
};

export default function PaytrTaksitTablosu({ price }: PaytrTaksitTablosuProps) {
  const scriptSrc = useMemo(() => {
    const amount = encodeURIComponent(String(price));
    return `https://www.paytr.com/odeme/taksit-tablosu/v2?token=f49ffd34f997c5ed48a3ef8835306d6e78ee92bb0519ed2222d7e99f63947916&merchant_id=675189&amount=${amount}&taksit=0&tumu=1`;
  }, [price]);

  useEffect(() => {
    const container = document.getElementById('paytr_taksit_tablosu');
    if (!container) return;

    // PayTR script'i container'ın içine HTML basar; price değişince üst üste binmesin.
    container.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptSrc;

    container.appendChild(script);

    return () => {
      // Eski widget/script kalıntılarını temizle
      try {
        if (script.parentNode) script.parentNode.removeChild(script);
      } catch {
        // ignore
      }
      container.innerHTML = '';
    };
  }, [scriptSrc]);

  return (
    <>
      <style jsx global>{`
        #paytr_taksit_tablosu{clear: both;font-size: 12px;max-width: 1200px;text-align: center;font-family: Arial, sans-serif;}
        #paytr_taksit_tablosu::before {display: table;content: " ";}
        #paytr_taksit_tablosu::after {content: "";clear: both;display: table;}
        .taksit-tablosu-wrapper{margin: 5px;width: 280px;padding: 12px;cursor: default;text-align: center;display: inline-block;border: 1px solid #e1e1e1;}
        .taksit-logo img{max-height: 28px;padding-bottom: 10px;}
        .taksit-tutari-text{float: left;width: 126px;color: #a2a2a2;margin-bottom: 5px;}
        .taksit-tutar-wrapper{display: inline-block;background-color: #f7f7f7;}
        .taksit-tutar-wrapper:hover{background-color: #e8e8e8;}
        .taksit-tutari{float: left;width: 126px;padding: 6px 0;color: #474747;border: 2px solid #ffffff;}
        .taksit-tutari-bold{font-weight: bold;}
        @media all and (max-width: 600px) {.taksit-tablosu-wrapper {margin: 5px 0;}}
      `}</style>
      <div id="paytr_taksit_tablosu" />
    </>
  );
}
