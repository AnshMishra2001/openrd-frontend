import { ObjectFilter } from "@/openrd-indexer/api/filter"
import {
  EventReturn,
  FilterTasksReturn,
  TaskReturn,
  TotalEventsReturn,
  UserEventsReturn,
  UserReturn,
} from "@/openrd-indexer/api/return-types"
import { replacer, reviver } from "@/openrd-indexer/utils/json"
import axios, { AxiosResponse } from "axios"
import { Address } from "viem"

const backendBaseUrl = "/indexer" as const

function checkError(res: AxiosResponse): void {
  if (res.status != 200) {
    throw new Error(
      `(${res.status}) Backend error: ${res.statusText}, Server repsonse: ${res.data}`
    )
  }
}

export async function getTask(
  chainId: number,
  taskId: bigint
): Promise<TaskReturn> {
  const res = await axios.get(
    `${backendBaseUrl}/task/${chainId.toString()}/${taskId.toString()}`
  )
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}

export async function getEvent(eventIndex: number): Promise<EventReturn> {
  const res = await axios.get(`${backendBaseUrl}/event/${eventIndex}`)
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}

export async function getUser(address: Address): Promise<UserReturn> {
  const res = await axios.get(`${backendBaseUrl}/user/${address}`)
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}

export async function filterTasks(
  filter: ObjectFilter
): Promise<FilterTasksReturn> {
  const res = await axios.post(
    `${backendBaseUrl}/filterTasks/`,
    JSON.parse(JSON.stringify(filter, replacer))
  )
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}

export async function userEvents(address: Address): Promise<UserEventsReturn> {
  const res = await axios.get(`${backendBaseUrl}/userEvents/${address}`)
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}

export async function getTotalEvents(): Promise<TotalEventsReturn> {
  const res = await axios.get(`${backendBaseUrl}/totalEvents`)
  checkError(res)
  return JSON.parse(JSON.stringify(res.data), reviver)
}