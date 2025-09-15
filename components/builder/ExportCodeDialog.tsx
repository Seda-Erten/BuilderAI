/**
 * Amaç: Oluşturulan kodu kullanıcıya modal içerisinde gösterip kopyalamasını sağlamak.
 * Props: isOpen, onOpenChange, exportedCode
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  exportedCode: string;
}

export function ExportCodeDialog({ isOpen, onOpenChange, exportedCode }: ExportCodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-[#1E293B]/95 backdrop-blur-xl border-slate-700/50 text-[#F8FAFC]">
        <DialogHeader>
          <DialogTitle className="text-[#F8FAFC]">Oluşturulan Kod</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-slate-300">Aşağıdaki kodu kopyalayıp projenizde kullanabilirsiniz.</p>
          <pre className="bg-slate-900 p-4 rounded-md text-sm overflow-auto max-h-[400px] text-green-300">
            <code>{exportedCode}</code>
          </pre>
          <Button
            onClick={() => navigator.clipboard.writeText(exportedCode)}
            className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-indigo-600 hover:to-cyan-600"
          >
            Kodu Kopyala
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}