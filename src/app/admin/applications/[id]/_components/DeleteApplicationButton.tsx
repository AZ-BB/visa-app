"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteApplication } from "@/actions/applications";

interface DeleteApplicationButtonProps {
  applicationId: string;
  canEdit: boolean;
  isDeleted: boolean;
}

export function DeleteApplicationButton({
  applicationId,
  canEdit,
  isDeleted,
}: DeleteApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!canEdit || isDeleted) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteApplication(applicationId);
      if (res.status) {
        setOpen(false);
        router.push("/admin/applications");
        router.refresh();
      } else {
        console.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
      >
        <Trash2 className="size-4 mr-1.5" />
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete application</DialogTitle>
            <DialogDescription>
              This only flags the application as deleted so it won&apos;t show
              up in the admin&apos;s application table, but it will still show
              up for the application client owner as they already paid for it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              {loading ? "Deleting…" : "Flag as deleted"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
