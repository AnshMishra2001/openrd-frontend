/* eslint-disable tailwindcss/no-unnecessary-arbitrary-value */
"use client"

import { useEffect, useState } from "react"
import { RFPsContract } from "@/openrd-indexer/contracts/RFPs"
import { IndexedRFP, RFP } from "@/openrd-indexer/types/rfp"
import { usePublicClient } from "wagmi"

import { chains } from "@/config/wagmi-config"
import { arrayToIndexObject } from "@/lib/array-to-object"
import { getRFP } from "@/lib/indexer"
import { useMetadata } from "@/hooks/useMetadata"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Link } from "@/components/ui/link"
import { Skeleton } from "@/components/ui/skeleton"
import { SanitizeHTML } from "@/components/sanitize-html"

import { ShowRFPMetadata } from "./show-rfp"
import { daysUntil, timestampToDateFormatted } from "@/lib/general-functions"

export function ShowRFPSummary({
  chainId,
  rfpId,
  index,
  onRFPInfo,
}: {
  chainId: number
  rfpId: bigint
  index: number
  onRFPInfo?: (rfpInfo: any) => void
}) {
  const chain = chains.find((c) => c.id === chainId)
  const publicClient = usePublicClient({ chainId: chainId })

  const [indexerRFP, setIndexerRFP] = useState<IndexedRFP | undefined>(
    undefined
  )

  const [blockchainRFP, setBlockchainRFP] = useState<RFP | undefined>(
    undefined
  )
  const directMetadata = useMetadata<ShowRFPMetadata | undefined>({
    url: blockchainRFP?.metadata,
    defaultValue: undefined,
    emptyValue: {},
  })

  const getBlockchainRFP = async () => {
    if (!publicClient) {
      return
    }

    const rawRFP = await publicClient.readContract({
      abi: RFPsContract.abi,
      address: RFPsContract.address,
      functionName: "getRFP",
      args: [rfpId],
    })

    const rfp: RFP = {
      budget: [...rawRFP.budget],
      creator: rawRFP.creator,
      deadline: rawRFP.deadline,
      disputeManager: rawRFP.disputeManager,
      escrow: rawRFP.escrow,
      manager: rawRFP.manager,
      tasksManager: rawRFP.tasksManager,
      metadata: rawRFP.metadata
    }
    setBlockchainRFP(rfp)
  }

  useEffect(() => {
    getBlockchainRFP().catch((err) => {
      console.error(err)
      setBlockchainRFP(undefined)
    })
  }, [rfpId, publicClient])

  useEffect(() => {
    const getIndexerRFP = async () => {
      const task = await getRFP(chainId, rfpId)
      setIndexerRFP(task)
    }

    getIndexerRFP().catch((err) => {
      console.error(err)
      setIndexerRFP(undefined)
    })
  }, [chainId, rfpId])

  useEffect(() => {
    if (blockchainRFP && onRFPInfo) {
      onRFPInfo({ chainId, rfpId, deadline: Number(blockchainRFP.deadline), budget: indexerRFP?.usdValue ?? 0});
    }
  }, [blockchainRFP, chainId, rfpId]);

  const indexedMetadata = indexerRFP?.cachedMetadata
    ? (JSON.parse(indexerRFP?.cachedMetadata) as ShowRFPMetadata)
    : undefined
  const title = indexedMetadata?.title
  const tags = indexedMetadata?.tags ?? []
  const usdValue = indexerRFP?.usdValue ?? 0
  const description =
    directMetadata?.description ??
    indexedMetadata?.description ??
    "No description was provided."
  const deadline = blockchainRFP?.deadline ?? indexerRFP?.deadline

  return (
    <Card
      className={`w-full justify-between gap-x-[10px] border-x-0 border-b-2 border-t-0 py-[20px] !shadow-none md:flex ${index !== 0 && "rounded-none"} ${index === 0 && "rounded-b-none"}`}
    >
      <div className="w-full px-2 md:flex md:px-[25px]">
        <div className="!px-0 md:w-[60%] lg:w-[55%] xl:w-[50%]">
          <CardHeader className="!px-0 !pb-0">
            <Link className="" href={`/tasks/${chainId}:${rfpId}`}>
              <div className="cursor-pointer text-lg font-bold">
                {title ?? <Skeleton className="h-6 w-[250px] bg-white" />}
              </div>
            </Link>
            <div className="overflow-hidden md:max-h-[100px]">
              <SanitizeHTML html={description} />
            </div>
          </CardHeader>
          <CardContent className="!px-0">
            <div className="space-x-1 space-y-2">
              <Badge variant="outline">
                Chain: {chain?.name ?? chainId.toString()}
              </Badge>
              <Badge variant="outline">Task ID: {rfpId.toString()}</Badge>
              {tags
                .filter((tag) => tag.tag !== undefined)
                .map((tag, i) => (
                  <Badge key={i}>{tag.tag}</Badge>
                ))}
            </div>
          </CardContent>
        </div>
        <div className="w-[22%] pt-8">
         ${usdValue}
        </div>
        <div className="w-[16%] pt-8 lg:w-[13%] xl:w-[10%]">
         {daysUntil(String(deadline))}
        </div>
      </div>
      <a className="my-auto" href={`/tasks/${chainId}:${rfpId}`}>
        <CardFooter className="my-auto mr-4 w-fit cursor-pointer whitespace-nowrap rounded-md border-[0.5px] border-[#0354EC] bg-transparent !py-[2px]  px-[10px] text-[15px] text-[#0354EC] hover:bg-[#0354EC] hover:text-white">
          View task
        </CardFooter>
      </a>
    </Card>
  )
}
