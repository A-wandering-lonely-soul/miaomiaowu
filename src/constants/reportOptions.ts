export interface ReportTypeOption {
  label: string
  value: string
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  { label: '言语不当/侮辱谩骂', value: '言语不当/侮辱谩骂' },
  { label: '色情低俗内容', value: '色情低俗内容' },
  { label: '广告骚扰', value: '广告骚扰' },
  { label: '散布谣言/虚假信息', value: '散布谣言/虚假信息' },
  { label: '其他', value: '其他' },
]
