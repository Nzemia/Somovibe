type PdfCardContentProps = {
  pdf: {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    price: number;
    teacher: {
      email: string;
    };
  };
  isPurchased: boolean;
};

export function PdfCardContent({ pdf, isPurchased }: PdfCardContentProps) {
  return (
    <>
      {/* Card header with badges */}
      <div className="flex items-start justify-between mb-3">
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
          {pdf.subject}
        </span>
        {isPurchased && (
          <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
            Purchased
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-foreground mb-2">{pdf.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {pdf.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <span>{pdf.grade}</span>
          <span>•</span>
          <span className="truncate">By {pdf.teacher.email.split("@")[0]}</span>
        </div>
      </div>

      {/* Card footer with price */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-2xl font-bold text-primary">KES {pdf.price}</p>
      </div>
    </>
  );
}
