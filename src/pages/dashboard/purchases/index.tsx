import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { purchaseColumns } from '../../../components/Columns/PurchaseColumns'
import { usePurchase } from '@/hooks/usePurchase'
import { IPurchase } from '@/types/purchase'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, PlusIcon } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { SupplierCombobox } from "@/components/Combobox/SupplierCombobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"
import { id as idLocale } from 'date-fns/locale'
import { Checkbox } from "@/components/ui/checkbox"
import { CheckedState } from "@radix-ui/react-checkbox"
import CustomExportDialog from "@/components/CustomExportDialog"
import { StatusCombobox } from "@/components/Combobox/StatusCombobox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Purchases = () => {
  const {
    purchases,
    mutate,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = usePurchase()
  const { toast } = useToast()
  const title = 'Pembelian'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowSm } = useBreakpoint('sm')

  const [exportDialog, setExportDialog] = useState(false)
  const [exportDialogDescription, setExportDialogDescription] = useState<string>("")
  const [exportIds, setExportIds] = useState<IPurchase['id'][] | undefined>(undefined);
  const [exportFileType, setExportFileType] = useState<"XLSX" | "CSV">("XLSX");

  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(new Date());
  const [isGroupedExport, setIsGroupedExport] = useState<CheckedState>(true);

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/purchases/?columns=id`,
      )

      return response.data.data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.errors
            : 'Terjadi kesalahan',
      })
    }
  }

  const handleExportData = async (
    fileType: 'XLSX' | 'CSV',
    id?: IPurchase['id'][]
  ) => {
    setExportFileType(fileType)
    setExportIds(id)
    setExportDialogDescription(`Filter ${id?.length ?? purchases?.data?.totalRowCount} data yang akan di export`)
    setExportDialog(true)
  }

  if (!can('access purchases')) {
    router.push('/dashboard')
    return <></>
  }

  return (
    <AppLayout
      customHeaderTitle={<Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Pembelian</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>}
      title={title}
      headerAction={
        <div className="flex flex-row space-x-2 ml-4">
          {can('create purchases') && (
            <Link href="purchases/new">
              <Button size="sm" className={`uppercase ${isBelowSm ? 'px-2' : ''}`}>
                {isBelowSm ? <PlusIcon size={18} /> : 'Tambah pembelian'}
              </Button>
            </Link>
          )}

          {can('force delete purchases') && (
            <Button
              variant="destructive"
              size="sm"
              className="uppercase"
              asChild
            >
              <Link href="purchases/trash">Sampah</Link>
            </Button>
          )}
        </div>
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          isValidating={isValidating}
          columns={purchaseColumns}
          data={purchases?.data}
          pagination={pagination}
          setPagination={setPagination}
          setFilter={setFilter}
          disabledContextMenu={disabledContextMenu}
          meta={{
            can,
            authUser,
            setDisabledContextMenu,
            handleGetAllId,
            handleExportData,
            mutate,
          }}
        />
      </ContentLayout>
      <CustomExportDialog
        open={exportDialog}
        onOpenChange={setExportDialog}
        description={exportDialogDescription}
        onContinue={async () => {
          const params = {
            id: exportIds,
            supplierId: selectedSupplierId,
            startDate: selectedStartDate && format(selectedStartDate, 'yyyy-MM-dd'),
            endDate: selectedEndDate && format(selectedEndDate, 'yyyy-MM-dd'),
            fileType: exportFileType,
          }
          try {
            const response = await axios.get(`api/v1/purchases/export`, {
              responseType: 'blob',
              params: {
                ..._.pickBy(params, value => !!value),
                isGrouped: isGroupedExport ? 1 : 0,
                status: selectedStatusId && selectedStatusId - 1,
              }
            })

            const moment = require('moment')

            const appName = process.env.NEXT_PUBLIC_APP_NAME

            const date = moment().format('YYYY-MM-DD')
            const time = moment().format('HHmmss')

            let fileName = title

            if (exportIds && exportIds.length > 0) {
              fileName += ' (Custom Export)'
            }

            if (selectedStartDate && selectedEndDate) {
              fileName += ` (Custom Range Export) ${selectedStartDate}-${selectedEndDate}`
            }

            fileName += ` ${date} T${time} ${appName}.${exportFileType?.toLowerCase()}`

            const url = URL.createObjectURL(
              new Blob([response.data], {
                type:
                  exportFileType === 'XLSX'
                    ? 'application/vnd.ms-excel'
                    : exportFileType === 'CSV'
                      ? 'text/csv'
                      : 'application/octet-stream',
              }),
            )
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()

          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Gagal',
              description:
                error instanceof AxiosError
                  ? error.response?.data.errors
                  : 'Terjadi kesalahan',
            })
          }
        }
        }
        title="Export Data"
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Status
            </label>
            <StatusCombobox
              hasReset={selectedStatusId ? true : false}
              value={selectedStatusId}
              onSelect={(statusId) => {
                setSelectedStatusId(statusId);
              }}
              statusData={[
                { id: 1, name: "Pending" },
                { id: 2, name: "Disetujui" },
              ]}
            />
          </div>
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Supplier
            </label>
            <SupplierCombobox
              hasReset={selectedSupplierId ? true : false}
              value={selectedSupplierId}
              onSelect={(supplierId) => {
                setSelectedSupplierId(supplierId);
              }}
            />
          </div>
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Rentang Tanggal
            </label>
            <div className="flex flex-row space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal py-2",
                      selectedStartDate && "text-muted-foreground"
                    )}
                  >
                    {selectedStartDate ? (
                      format(selectedStartDate, "PPP", { locale: idLocale })
                    ) : (
                      <span>Tanggal Awal</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    disabled={(date) =>
                      (selectedEndDate && date > selectedEndDate) || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal py-2",
                      selectedEndDate && "text-muted-foreground"
                    )}
                  >
                    {selectedEndDate ? (
                      format(selectedEndDate, "PPP", { locale: idLocale })
                    ) : (
                      <span>Tanggal Akhir</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center">
            <Checkbox id="group" className="mr-2" checked={isGroupedExport} onCheckedChange={setIsGroupedExport} />
            <label
              htmlFor="product"
              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-start"
            >
              Kelompokkan produk berdasarkan No. Pembelian
            </label>
          </div>
        </div>
      </CustomExportDialog>
    </AppLayout >
  )
}

export default withProtected(Purchases)
