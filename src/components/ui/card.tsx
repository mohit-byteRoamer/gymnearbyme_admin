import * as React from 'react'
import {
  Card as UICard,
  CardHeader as UICardHeader,
  CardTitle as UICardTitle,
  CardDescription as UICardDescription,
  CardContent as UICardContent,
  CardFooter as UICardFooter,
  CardProps,
} from '@/shared/ui'

export function Card(props: CardProps) {
  return <UICard {...props} />
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <UICardHeader {...props} />
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <UICardTitle {...props} />
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <UICardDescription {...props} />
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <UICardContent {...props} />
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <UICardFooter {...props} />
}

export default Card
