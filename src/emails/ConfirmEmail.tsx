import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type ConfirmEmailProps = {
  confirmUrl: string
  displayName?: string
}

// 新規登録メール確認テンプレート
const ConfirmEmail = ({ confirmUrl, displayName }: ConfirmEmailProps) => (
  <Html lang="ja">
    <Head />
    <Preview>☕ もくカフェ — メールアドレスを確認してください</Preview>
    <Body style={body}>
      <Container style={container}>

        {/* ヘッダー */}
        <Section style={header}>
          <Text style={logo}>☕ もくカフェ</Text>
          <Text style={tagline}>カフェで作業仲間を見つけよう</Text>
        </Section>

        {/* メインコンテンツ */}
        <Section style={content}>
          <Heading style={heading}>
            メールアドレスの確認
          </Heading>

          <Text style={paragraph}>
            {displayName ? `${displayName} さん、` : ""}はじめまして！
          </Text>
          <Text style={paragraph}>
            もくカフェへのご登録ありがとうございます。
            以下のボタンをクリックして、メールアドレスの確認を完了してください。
          </Text>

          <Section style={buttonWrapper}>
            <Button style={button} href={confirmUrl}>
              メールアドレスを確認する
            </Button>
          </Section>

          <Text style={note}>
            ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください。
          </Text>
          <Text style={urlText}>{confirmUrl}</Text>

          <Hr style={divider} />

          <Text style={footer}>
            このメールに心当たりがない場合は、無視していただいて構いません。
            リンクは24時間有効です。
          </Text>
        </Section>

        {/* フッター */}
        <Section style={footerSection}>
          <Text style={footerText}>© 2024 もくカフェ</Text>
        </Section>

      </Container>
    </Body>
  </Html>
)

export default ConfirmEmail

// --- スタイル（もくカフェデザインシステムに合わせたコーヒーブラウン） ---

const body = {
  backgroundColor: "#f5f5f4", // stone-100
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  margin: "0",
  padding: "0",
}

const container = {
  maxWidth: "520px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden" as const,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

const header = {
  backgroundColor: "#78350f", // amber-900
  padding: "32px 40px 24px",
  textAlign: "center" as const,
}

const logo = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 4px",
}

const tagline = {
  color: "#fde68a", // amber-200
  fontSize: "12px",
  margin: "0",
}

const content = {
  padding: "36px 40px 28px",
}

const heading = {
  color: "#1c1917", // stone-900
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 20px",
}

const paragraph = {
  color: "#44403c", // stone-700
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 12px",
}

const buttonWrapper = {
  textAlign: "center" as const,
  margin: "28px 0",
}

const button = {
  backgroundColor: "#78350f", // amber-900
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
  borderRadius: "10px",
  padding: "14px 32px",
  display: "inline-block",
}

const note = {
  color: "#78716c", // stone-500
  fontSize: "12px",
  margin: "0 0 6px",
}

const urlText = {
  color: "#78350f",
  fontSize: "11px",
  wordBreak: "break-all" as const,
  margin: "0 0 24px",
}

const divider = {
  borderColor: "#e7e5e4", // stone-200
  margin: "24px 0",
}

const footer = {
  color: "#a8a29e", // stone-400
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
}

const footerSection = {
  backgroundColor: "#f5f5f4", // stone-100
  padding: "16px 40px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#a8a29e",
  fontSize: "11px",
  margin: "0",
}
