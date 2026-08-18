"use client";

import Link from "next/link";
import { useState } from "react";
import { claimNeedAction, reassignNeedAction } from "@/lib/actions";

export function NeedActions({
  needId,
  claimed,
  members,
  labels,
}: {
  needId: string;
  claimed: boolean;
  members: { id: string; name: string }[];
  labels: { claim: string; reassign: string; bought: string; clearClaim: string };
}) {
  const [openReassign, setOpenReassign] = useState(false);

  return (
    <div className="flex flex-wrap gap-1.5">
      {!claimed ? (
        <form action={claimNeedAction}>
          <input type="hidden" name="needId" value={needId} />
          <button
            type="submit"
            className="rounded-[10px] border border-line bg-white px-2.5 py-1.5 text-xs font-bold"
          >
            {labels.claim}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpenReassign((v) => !v)}
          className="rounded-[10px] border border-line bg-white px-2.5 py-1.5 text-xs font-bold"
        >
          {labels.reassign}
        </button>
      )}
      <Link
        href={`/needs/${needId}/bought`}
        className="rounded-[10px] border border-line bg-white px-2.5 py-1.5 text-xs font-bold"
      >
        {labels.bought}
      </Link>

      {openReassign ? (
        <form action={reassignNeedAction} className="mt-2 w-full rounded-xl border border-line bg-[#fff9f4] p-2">
          <input type="hidden" name="needId" value={needId} />
          <select
            name="memberId"
            className="mb-2 h-9 w-full rounded-lg border border-line bg-white px-2 text-sm"
            defaultValue={members[0]?.id}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
            <option value="">{labels.clearClaim}</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-accent text-xs font-bold text-white"
          >
            {labels.reassign}
          </button>
        </form>
      ) : null}
    </div>
  );
}
