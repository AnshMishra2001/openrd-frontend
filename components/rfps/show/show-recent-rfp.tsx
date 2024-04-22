/* eslint-disable tailwindcss/no-unnecessary-arbitrary-value */
"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { ShowRFPSummary } from "./show-rfp-summary"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
// import { defaultFilter, formSchema } from "../filter/tasks-filter"

export interface RFPIndentifier {
  chainId: number
  rfpId: bigint
}
interface RFPIncremented extends RFPIndentifier {
  deadline: number;
  budget: number;
}

export function ShowRecentRFPs({ rfpList }: { rfpList: RFPIndentifier[] }) {
  const [showRFPCount, setShowRFPCount] = useState<number>(10)
  const [metadataRFPs, setMetadataRFPs] = useState<RFPIncremented[]>([]);
  const [orderedRFPsFinal, setOrderedRFPsFinal] = useState<RFPIndentifier[]>(rfpList);
  const [orderRFPsByDeadlineAsc, setOrderRFPsByDeadlineAsc] = useState<boolean>(false);
  const [orderRFPsByBudgetAsc, setOrderRFPsByBudgetAsc] = useState<boolean>(false);

  const handleRFPInfo = (rfpInfo: RFPIncremented) => {
    setMetadataRFPs((currentRFPs) => {
      const index = currentRFPs.findIndex(t => t.rfpId === rfpInfo.rfpId);
      if (index >= 0) {
        currentRFPs[index] = rfpInfo;
      } else {
        currentRFPs.push(rfpInfo);
      }
      return [...currentRFPs];
    });
  };


  function handleOrderRFPByDeadline() {
    const sortedRFPs = [...metadataRFPs].sort((a, b) => {
      return orderRFPsByDeadlineAsc ? a.deadline - b.deadline : b.deadline - a.deadline;
    });
    
    setOrderedRFPsFinal(sortedRFPs)
    setOrderRFPsByDeadlineAsc(!orderRFPsByDeadlineAsc);
    setOrderRFPsByBudgetAsc(false)
  }

  function handleOrderRFPByBudget() {
    const sortedRFPs = [...metadataRFPs].sort((a, b) => {
      return orderRFPsByBudgetAsc ? a.budget - b.budget : b.budget - a.budget;
    });
    
    setOrderedRFPsFinal(sortedRFPs)
    setOrderRFPsByBudgetAsc(!orderRFPsByBudgetAsc);
    setOrderRFPsByDeadlineAsc(false)
  }

  useEffect(() => {
    setOrderedRFPsFinal(rfpList);
  }, [rfpList]);


  return (
    <div>
      <div className="flex  overflow-x-auto rounded-[10px] border-[0.7px] bg-transparent px-[25px] py-[10px] text-[16px] font-medium">
        <div className="w-[45%]">
          <p
            onClick={() => {
            }}
            className=""
          >
            Project
          </p>
        </div>
        <div className="flex w-[20%] items-center">
          <p className="pr-[10px]">Budget</p>
          <svg
            width="11"
            onClick={handleOrderRFPByBudget}
            className={`w-[10px] cursor-pointer dark:hidden lg:w-[14px] ${orderRFPsByBudgetAsc && 'rotate-180'}`}
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.336336"
              y1="1.08462"
              x2="5.33634"
              y2="5.63007"
              stroke="black"
            />
            <line
              x1="10.3536"
              y1="1.35355"
              x2="5.35355"
              y2="6.35355"
              stroke="black"
            />
          </svg>
          <svg
            width="11"
            onClick={handleOrderRFPByBudget}
            className={`hidden w-[10px] cursor-pointer dark:flex lg:w-[14px] ${orderRFPsByBudgetAsc && 'rotate-180'}`}
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.336336"
              y1="1.08462"
              x2="5.33634"
              y2="5.63007"
              stroke="white"
            />
            <line
              x1="10.3536"
              y1="1.35355"
              x2="5.35355"
              y2="6.35355"
              stroke="white"
            />
          </svg>
        </div>
        <div className="flex w-[20%] items-center">
          <p className="pr-[10px]">Deadline</p>
          <svg
            width="11"
            onClick={handleOrderRFPByDeadline}
            className={`w-[10px] cursor-pointer dark:hidden lg:w-[14px] ${orderRFPsByDeadlineAsc && 'rotate-180'}`}
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.336336"
              y1="1.08462"
              x2="5.33634"
              y2="5.63007"
              stroke="black"
            />
            <line
              x1="10.3536"
              y1="1.35355"
              x2="5.35355"
              y2="6.35355"
              stroke="black"
            />
          </svg>
          <svg
            width="11"
            onClick={handleOrderRFPByDeadline}
            className={`hidden w-[10px] cursor-pointer dark:flex lg:w-[14px] ${orderRFPsByDeadlineAsc && 'rotate-180'}`}
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.336336"
              y1="1.08462"
              x2="5.33634"
              y2="5.63007"
              stroke="white"
            />
            <line
              x1="10.3536"
              y1="1.35355"
              x2="5.35355"
              y2="6.35355"
              stroke="white"
            />
          </svg>
        </div>
      </div>
      {orderedRFPsFinal.slice(0, showRFPCount).map((rfp, i) => (
        <ShowRFPSummary key={`${rfp.rfpId}-${i}`} {...rfp} index={i} onRFPInfo={(value) => {
          console.log(value)
          handleRFPInfo(value)
        }} />
      ))}
      {showRFPCount < rfpList.length && (
        <Button
          onClick={() => {
            setShowRFPCount(showRFPCount + 10)
          }}
        >
          Show more
        </Button>
      )}
    </div>
  )
}
