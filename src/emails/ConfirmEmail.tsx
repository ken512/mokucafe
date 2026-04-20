import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

type ConfirmEmailProps = {
  confirmUrl: string
  displayName?: string
}

// 新規登録メール確認テンプレート（もくカフェデザインシステム準拠）
const ConfirmEmail = ({ confirmUrl, displayName = "ゲスト" }: ConfirmEmailProps) => (
  <Html lang="ja">
    <Head />
    <Preview>☕ もくカフェ — メールアドレスを確認して、カフェ仲間を見つけよう</Preview>
    <Body style={body}>
      <Container style={container}>

        {/* ─── ヘッダー ─── */}
        <Section style={header}>
          <Text style={logo}>☕ もくカフェ</Text>
          <Text style={tagline}>カフェで作業仲間を見つけよう</Text>
        </Section>

        {/* ─── ヒーロー ─── */}
        <Section style={hero}>
          <Text style={heroEmoji}>🫖</Text>
          <Text style={heroTitle}>ようこそ、{displayName} さん！</Text>
          <Text style={heroSub}>
            もくカフェへのご登録ありがとうございます。
            <br />
            まずはメールアドレスの確認をお願いします。
          </Text>
        </Section>

        {/* ─── CTAボタン ─── */}
        <Section style={buttonSection}>
          <Button style={button} href={confirmUrl}>
            ✅ メールアドレスを確認する
          </Button>
          <Text style={buttonNote}>
            ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください。
          </Text>
          <Text style={urlText}>{confirmUrl}</Text>
        </Section>

        <Hr style={divider} />

        {/* ─── 機能紹介 ─── */}
        <Section style={featuresSection}>
          <Heading style={featuresHeading}>確認後にできること</Heading>
          <Row>
            <Column style={featureCol}>
              <Text style={featureIcon}>📋</Text>
              <Text style={featureTitle}>作業仲間を募集</Text>
              <Text style={featureDesc}>
                行きたいカフェと時間を投稿して、一緒に作業する仲間を募ろう
              </Text>
            </Column>
            <Column style={featureColMiddle}>
              <Text style={featureIcon}>🤝</Text>
              <Text style={featureTitle}>募集に参加</Text>
              <Text style={featureDesc}>
                近くのカフェで作業中の人を見つけて、申請するだけで参加できる
              </Text>
            </Column>
            <Column style={featureCol}>
              <Text style={featureIcon}>☕</Text>
              <Text style={featureTitle}>カフェで繋がる</Text>
              <Text style={featureDesc}>
                同じ場所・同じ時間に集まって、もくもく作業を楽しもう
              </Text>
            </Column>
          </Row>
        </Section>

        <Hr style={divider} />

        {/* ─── 注意書き ─── */}
        <Section style={noticeSection}>
          <Text style={noticeText}>
            このメールに心当たりがない場合は、無視していただいて構いません。
            確認リンクは <strong>24時間</strong> 有効です。
          </Text>
        </Section>

        {/* ─── フッター ─── */}
        <Section style={footerSection}>
          <Text style={footerBrand}>☕ もくカフェ</Text>
          <Text style={footerText}>
            カフェで作業仲間を見つけるアプリ
          </Text>
          <Text style={footerCopy}>© 2025 もくカフェ. All rights reserved.</Text>
        </Section>

      </Container>
    </Body>
  </Html>
)

export default ConfirmEmail

// ─── スタイル ───

const body = {
  backgroundColor: "#f5f5f4", // stone-100
  fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif",
  margin: "0",
  padding: "20px 0 40px",
}

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden" as const,
  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
}

// ヘッダー
const header = {
  backgroundColor: "#78350f", // amber-900
  padding: "24px 40px 20px",
  textAlign: "center" as const,
}

const logo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 4px",
  letterSpacing: "0.5px",
}

const tagline = {
  color: "#fde68a", // amber-200
  fontSize: "12px",
  margin: "0",
  letterSpacing: "0.3px",
}

// ヒーロー
const hero = {
  backgroundColor: "#fffbeb", // amber-50
  padding: "36px 40px 28px",
  textAlign: "center" as const,
  borderBottom: "1px solid #fde68a",
}

const heroEmoji = {
  fontSize: "48px",
  margin: "0 0 12px",
  lineHeight: "1",
}

const heroTitle = {
  color: "#1c1917", // stone-900
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 12px",
  lineHeight: "1.4",
}

const heroSub = {
  color: "#57534e", // stone-600
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0",
}

// CTAボタン
const buttonSection = {
  padding: "32px 40px 24px",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#78350f", // amber-900
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  borderRadius: "12px",
  padding: "16px 40px",
  display: "inline-block",
  letterSpacing: "0.5px",
}

const buttonNote = {
  color: "#78716c", // stone-500
  fontSize: "12px",
  margin: "20px 0 6px",
}

const urlText = {
  color: "#92400e", // amber-800
  fontSize: "11px",
  wordBreak: "break-all" as const,
  margin: "0",
  backgroundColor: "#fef3c7", // amber-100
  padding: "8px 12px",
  borderRadius: "6px",
  display: "block",
}

const divider = {
  borderColor: "#e7e5e4", // stone-200
  margin: "0",
}

// 機能紹介
const featuresSection = {
  padding: "28px 32px",
  backgroundColor: "#fafaf9", // stone-50
}

const featuresHeading = {
  color: "#44403c", // stone-700
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 20px",
  textAlign: "center" as const,
  letterSpacing: "0.5px",
}

const featureCol = {
  width: "33%",
  textAlign: "center" as const,
  padding: "0 8px",
}

const featureColMiddle = {
  width: "33%",
  textAlign: "center" as const,
  padding: "0 8px",
  borderLeft: "1px solid #e7e5e4",
  borderRight: "1px solid #e7e5e4",
}

const featureIcon = {
  fontSize: "28px",
  margin: "0 0 8px",
  lineHeight: "1",
}

const featureTitle = {
  color: "#78350f", // amber-900
  fontSize: "12px",
  fontWeight: "700",
  margin: "0 0 6px",
}

const featureDesc = {
  color: "#78716c", // stone-500
  fontSize: "11px",
  lineHeight: "1.7",
  margin: "0",
}

// 注意書き
const noticeSection = {
  padding: "16px 40px",
  backgroundColor: "#fafaf9",
}

const noticeText = {
  color: "#a8a29e", // stone-400
  fontSize: "12px",
  lineHeight: "1.7",
  margin: "0",
  textAlign: "center" as const,
}

// フッター
const footerSection = {
  backgroundColor: "#1c1917", // stone-900
  padding: "20px 40px",
  textAlign: "center" as const,
}

const footerBrand = {
  color: "#fde68a", // amber-200
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
}

const footerText = {
  color: "#a8a29e", // stone-400
  fontSize: "11px",
  margin: "0 0 8px",
}

const footerCopy = {
  color: "#57534e", // stone-600
  fontSize: "10px",
  margin: "0",
}
