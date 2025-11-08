export type Appreciation = {
  title: string
  message: string
}

type Options = {
  userName?: string | null
  tone?: 'affectionate' | 'professional' | 'playful' | 'balanced' | string
}

export function getAppreciation(taskTitle: string, options: Options = {}): Appreciation {
  const { userName } = options
  // Only short, friendly variants
  const variants = [
    {
      title: `Well done${userName ? ", " + userName : ""}!`,
      message: `Sunshine, you're the best!`,
    },
    {
      title: `Great work${userName ? ", " + userName : ""}!`,
      message: `Cutie, you crushed it!`,
    },
    {
      title: `Awesome job${userName ? ", " + userName : ""}!`,
      message: `Legend, keep shining!`,
    },
    {
      title: `Yay${userName ? ", " + userName : ""}!`,
      message: `You did it! �`,
    },
  ]
  // Deterministic pick based on taskTitle
  const idx = Math.abs(
    taskTitle.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7),
  ) % variants.length
  return variants[idx]
}

export default getAppreciation
