export function ParagraphCN({heading}: {heading: string}) {
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-6">
       {heading}
      </p>
    )
  }
  