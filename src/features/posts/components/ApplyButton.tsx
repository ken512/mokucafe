"use client"

import Button from "@/components/ui/Button"

type Props = {
  postId: number
}

// 参加申請ボタン（申請APIの実装時に useApply フックに接続する）
const ApplyButton = ({ postId: _ }: Props) => {
  return (
    <Button variant="primary" size="lg" fullWidth type="button" disabled>
      参加申請する（近日公開）
    </Button>
  )
}

export default ApplyButton
