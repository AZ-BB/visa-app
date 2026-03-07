"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditApplicationModal } from "./EditApplicationModal";
import type { Application } from "@/actions/applications";

export function EditApplicationButton({
  application,
  canEdit,
}: {
  application: Application;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!canEdit) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4 mr-1.5" />
        Edit application
      </Button>
      <EditApplicationModal application={application} open={open} onOpenChange={setOpen} />
    </>
  );
}
