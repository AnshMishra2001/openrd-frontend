"use client"

import { Filter, ObjectFilter } from "@/openrd-indexer/api/filter"
import { FilterTasksReturn } from "@/openrd-indexer/api/return-types"
import { parseBigInt } from "@/openrd-indexer/utils/parseBigInt"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { filterTasks } from "@/lib/indexer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ErrorWrapper } from "@/components/ui/error-wrapper"
import { Form, FormControl, FormItem, FormMessage } from "@/components/ui/form"

import {
  FilterControl,
  filterFieldOptions,
  FilterProperty,
  FilterString,
  filterTypeOptions,
} from "./filter-control"

function getSubfilter(
  obj: ObjectFilter,
  property: FilterProperty
): ObjectFilter {
  switch (property) {
    case FilterProperty.Title:
    case FilterProperty.ProjectSize:
    case FilterProperty.TeamSize:
    case FilterProperty.Description:
      if (!obj.cachedMetadata) {
        obj.cachedMetadata = {}
      }
      if (!obj.cachedMetadata.objectFilter) {
        obj.cachedMetadata.objectFilter = {}
      }
      return obj.cachedMetadata.objectFilter
    case FilterProperty.ChainId:
    case FilterProperty.TaskId:
    case FilterProperty.Deadline:
    case FilterProperty.Manager:
    case FilterProperty.DisputeManager:
    case FilterProperty.Creator:
    case FilterProperty.State:
    case FilterProperty.UsdValue:
      return obj
  }
}

function getPropertyType(
  property: FilterProperty
): "number" | "bigint" | "string" {
  switch (property) {
    case FilterProperty.Title:
    case FilterProperty.Description:
    case FilterProperty.Manager:
    case FilterProperty.DisputeManager:
    case FilterProperty.Creator:
      return "string"
    case FilterProperty.Deadline:
    case FilterProperty.TaskId:
      return "bigint"
    case FilterProperty.ProjectSize:
    case FilterProperty.TeamSize:
    case FilterProperty.ChainId:
    case FilterProperty.State:
    case FilterProperty.UsdValue:
      return "number"
  }
}

function applyType(
  filter: FilterString,
  type: "number" | "bigint" | "string"
): Filter {
  const parse =
    type === "number"
      ? parseInt
      : type === "bigint"
        ? parseBigInt
        : (id: string) => id
  const parsedFilter: Filter = {}
  if (filter.min) {
    const parsedValue = parse(filter.min)
    if (typeof parsedValue !== "string") {
      parsedFilter.min = parsedValue
    }
  }
  if (filter.max) {
    const parsedValue = parse(filter.max)
    if (typeof parsedValue !== "string") {
      parsedFilter.max = parsedValue
    }
  }
  if (filter.equal) {
    const parsedValue = parse(filter.equal)
    parsedFilter.equal = parsedValue
  }
  if (filter.includes) {
    const parsedValue = parse(filter.includes)
    parsedFilter.includes = parsedValue
  }
  if (filter.oneOf) {
    const parsedValue = filter.oneOf.split(",").map((item) => {
      return { equal: parse(item) }
    })
    parsedFilter.oneOf = parsedValue
  }
  return parsedFilter
}

const formSchema = z.object({
  filter: z
    .object({
      property: z.nativeEnum(FilterProperty),
      value: z.object({
        min: z.string().optional(),
        max: z.string().optional(),
        equal: z.string().optional(),
        includes: z.string().optional(),
        oneOf: z.string().optional(),
      }),
    })
    .array(),
})

export function TasksFilter({
  onFilterApplied,
}: {
  onFilterApplied: (filtered: FilterTasksReturn | undefined) => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filter: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const getFilteredTasks = async () => {
      if (values.filter.length === 0) {
        onFilterApplied(undefined)
        return
      }

      const filteredTasks = await filterTasks(
        values.filter.reduce((acc, value) => {
          if (!value.property || Object.keys(value).length === 0) {
            // skip
            return acc
          }

          let obj = getSubfilter(acc, value.property)
          obj[value.property] = {
            ...obj[value.property],
            ...applyType(value.value, getPropertyType(value.property)),
          }
          return acc
        }, {} as ObjectFilter)
      )
      onFilterApplied(filteredTasks)
    }

    getFilteredTasks().catch(console.error)
  }

  const {
    fields: filter,
    append: appendFilter,
    remove: removeFilter,
    update: updateFilter,
  } = useFieldArray({
    name: "filter",
    control: form.control,
  })

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl">Filter tasks</AccordionTrigger>
        <AccordionContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormItem>
                <FormControl>
                  <div>
                    {filter.map((filterItem, i) => (
                      <ErrorWrapper
                        key={i}
                        error={form.formState.errors.filter?.at?.(i)}
                      >
                        <div className="flex gap-x-1 w-full">
                          <FilterControl
                            values={{
                              property: filterItem.property,
                              value: filterItem.value,
                            }}
                            onChange={(change) => {
                              updateFilter(i, change)
                              form.trigger("filter")
                            }}
                          />
                          <Button
                            onClick={() => removeFilter(i)}
                            variant="destructive"
                          >
                            X
                          </Button>
                        </div>
                      </ErrorWrapper>
                    ))}
                    <Button
                      onClick={() =>
                        appendFilter({
                          property: filterFieldOptions[0].value,
                          value: { [filterTypeOptions[0].value]: "" },
                        })
                      }
                    >
                      Add filter
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              <Button type="submit">Apply filters</Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}