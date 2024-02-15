"use client"

import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/components/ui/link"
import { TasksFilter } from "@/components/tasks/filter/tasks-filter"

import { ShowRecentTasks, TaskIndentifier } from "./show-recent-tasks"

export function TaskOverview() {
  const [taskList, setTaskList] = useState<TaskIndentifier[] | undefined>(
    undefined
  )

  return (
    <div className="grid grid-cols-1 gap-y-3">
      <Link href="/tasks/create" className={buttonVariants()}>
        Create
      </Link>
      <TasksFilter onFilterApplied={setTaskList} />
      <ShowRecentTasks taskList={taskList} />
    </div>
  )
}