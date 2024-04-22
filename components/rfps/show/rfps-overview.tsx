"use client"

import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/components/ui/link"
// import { RFPsFilter } from "@/components/tasks/filter/tasks-filter"

import { ShowRecentRFPs, RFPIndentifier } from "./show-recent-rfp"

export function RFPOverview() {
  const [rfpList, setRFPList] = useState<RFPIndentifier[]>([])

  return (
    <div className="grid grid-cols-1 gap-y-3">
      <Link href="/rfps/create" className="flex w-fit cursor-pointer items-center justify-center rounded-md border-[0.5px] border-[#0354EC] bg-transparent !py-[2px] px-[10px] text-[14px] text-[#0354EC] hover:bg-[#0354EC] hover:text-white md:ml-auto">
        + Submit a Proposal
      </Link>
      {/* <RFPsFilter onFilterApplied={setRFPList} /> */}
      <ShowRecentRFPs rfpList={rfpList} />
    </div>
  )
}
