import { Html, Head, Body, Container, Row, Column, Text, Button, Hr, Img } from '@react-email/components';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  shippingAddress?: {
    title?: string;
    line1: string;
    line2?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  };
}

export default function OrderConfirmation({
  orderNumber,
  customerName,
  customerEmail,
  items,
  totalAmount,
  orderDate,
  shippingAddress,
}: OrderConfirmationProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Row style={header}>
            <Column align="center">
              <Text style={logo}>MatbaaGross</Text>
              <Text style={tagline}>Türkiye'nin Online Matbaası</Text>
            </Column>
          </Row>

          {/* Success Message */}
          <Row style={section}>
            <Column align="center">
              <div style={successIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#10B981" />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <Text style={title}>Siparişiniz Alındı!</Text>
              <Text style={subtitle}>
                Sayın {customerName}, siparişiniz başarıyla alınmış ve hazırlanmaya başlanmıştır.
              </Text>
            </Column>
          </Row>

          {/* Order Details */}
          <Row style={section}>
            <Column>
              <Text style={sectionTitle}>Sipariş Detayları</Text>
              <div style={orderInfo}>
                <div style={infoRow}>
                  <Text style={infoLabel}>Sipariş Numarası:</Text>
                  <Text style={infoValue}>{orderNumber}</Text>
                </div>
                <div style={infoRow}>
                  <Text style={infoLabel}>Sipariş Tarihi:</Text>
                  <Text style={infoValue}>{formatDate(orderDate)}</Text>
                </div>
                <div style={infoRow}>
                  <Text style={infoLabel}>E-posta:</Text>
                  <Text style={infoValue}>{customerEmail}</Text>
                </div>
              </div>
            </Column>
          </Row>

          {/* Products Table */}
          <Row style={section}>
            <Column>
              <Text style={sectionTitle}>Sipariş Edilen Ürünler</Text>
              <div style={tableContainer}>
                {items.map((item, index) => (
                  <div key={index} style={productRow}>
                    <div style={productInfo}>
                      <div style={productDetails}>
                        <Text style={productName}>{item.productName}</Text>
                        <Text style={productMeta}>Adet: {item.quantity} | Birim Fiyat: {formatPrice(item.unitPrice)}</Text>
                      </div>
                    </div>
                    <Text style={productPrice}>{formatPrice(item.totalPrice)}</Text>
                  </div>
                ))}
              </div>
            </Column>
          </Row>

          {/* Shipping Address */}
          {shippingAddress && (
            <Row style={section}>
              <Column>
                <Text style={sectionTitle}>Teslimat Adresi</Text>
                <div style={addressBox}>
                  {shippingAddress.title && (
                    <Text style={addressTitle}>{shippingAddress.title}</Text>
                  )}
                  <Text style={addressLine}>{shippingAddress.line1}</Text>
                  {shippingAddress.line2 && (
                    <Text style={addressLine}>{shippingAddress.line2}</Text>
                  )}
                  {(shippingAddress.district || shippingAddress.city || shippingAddress.postalCode) && (
                    <Text style={addressLine}>
                      {[
                        shippingAddress.district,
                        shippingAddress.city,
                        shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                  </Text>
                )}
                </div>
              </Column>
            </Row>
          )}

          {/* Total */}
          <Row style={section}>
            <Column>
              <div style={totalContainer}>
                <div style={totalRow}>
                  <Text style={totalLabel}>Genel Toplam:</Text>
                  <Text style={totalValue}>{formatPrice(totalAmount)}</Text>
                </div>
              </div>
            </Column>
          </Row>

          {/* CTA */}
          <Row style={section}>
            <Column align="center">
              <Button href="https://matbaagross.com/hesabim/siparisler" style={button}>
                Siparişlerimi Görüntüle
              </Button>
              <Text style={helpText}>
                Sorularınız için bize{' '}
                <a href="mailto:destek@matbaagross.com" style={link}>
                  destek@matbaagross.com
                </a>{' '}
                adresinden ulaşabilirsiniz.
              </Text>
            </Column>
          </Row>

          {/* Footer */}
          <Row style={footer}>
            <Column align="center">
              <Text style={footerText}>
                Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
              </Text>
              <Hr style={hr} />
              <Text style={footerText}>
                © 2024 MatbaaGross. Tüm hakları saklıdır.
              </Text>
            </Column>
          </Row>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const header = {
  padding: '30px 0',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
};

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#FF6000',
  margin: '0',
};

const tagline = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '5px 0 0 0',
};

const section = {
  padding: '20px 0',
};

const successIcon = {
  margin: '0 auto 20px',
  width: '48px',
  height: '48px',
};

const title = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
};

const subtitle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 30px 0',
  textAlign: 'center' as const,
  lineHeight: '1.5',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 15px 0',
};

const orderInfo = {
  backgroundColor: '#f9fafb',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const infoLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const infoValue = {
  fontSize: '14px',
  color: '#1f2937',
  margin: '0',
  fontWeight: '500',
};

const tableContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden',
};

const productRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  borderBottom: '1px solid #e5e7eb',
};

const productInfo = {
  flex: 1,
};

const productDetails = {
  display: 'flex',
  flexDirection: 'column' as const,
};

const productName = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#1f2937',
  margin: '0 0 4px 0',
};

const productMeta = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const productPrice = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const addressBox = {
  backgroundColor: '#f9fafb',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const addressTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const addressLine = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px 0',
};

const totalContainer = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const totalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const totalValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#FF6000',
  margin: '0',
};

const button = {
  backgroundColor: '#FF6000',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  display: 'inline-block',
};

const helpText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '20px 0 0 0',
  textAlign: 'center' as const,
  lineHeight: '1.5',
};

const link = {
  color: '#FF6000',
  textDecoration: 'none',
};

const footer = {
  padding: '20px 0 0 0',
  borderTop: '1px solid #e5e7eb',
  marginTop: '20px',
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '10px 0',
};
