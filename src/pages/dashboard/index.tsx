import AppLayout from '@/components/Layouts/AppLayout'
import ContentLayout from '@/components/Layouts/ContentLayout'
import withProtected from '@/hoc/withProtected'
import currencyFormatter from "@/lib/currency";
import { ArrowBottomLeftIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";
import { CreditCardIcon, ShoppingBagIcon, Users2Icon } from "lucide-react"
import RevenueChart, { IRevenueData } from "../../components/RevenueChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { CalendarDateRangePicker } from "@/components/DateRangePicker";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subMonths } from "date-fns";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { IInvoice } from "@/types/invoice";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface CardProps {
  title: string;
  data: string;
  icon: React.ReactNode;
  trend: number | null;
}
const DashboardCard = ({ title, data, icon, trend }: CardProps) => {
  return (
    <div className="flex flex-col w-full bg-zinc-50 px-4 py-4 shadow-md dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg">
      <div className="flex flex-row justify-between">
        {icon}
        {trend !== null && trend > 0 ? (
          <div className="flex items-center bg-green-200/60 dark:bg-green-500/60 h-4 rounded-lg text-[0.5rem] text-green-500 dark:text-white px-1 font-semibold">
            <ArrowTopRightIcon height={11} width={11} />
            <span>+{trend}%</span>
          </div>
        ) : trend !== null && trend < 0 ? (
          <div className="flex items-center bg-red-200/60 dark:bg-red-500/60 h-4 rounded-lg text-[0.5rem] text-red-500 dark:text-white px-1 font-semibold">
            <ArrowBottomLeftIcon height={11} width={11} />
            <span>{trend}%</span>
          </div>
        ) : trend !== null && trend === 0 ? (
          <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-500/60 h-4 rounded-lg text-[0.5rem] text-zinc-500 dark:text-white px-2 font-semibold">
            {trend}%
          </div>
        ) : null}
      </div>
      <p className="mt-5 text-xs">{title}</p>
      <p className="text-xl font-bold">{data}</p>
    </div>
  )
}

interface InvoiceParams {
  columns: string;
  from_date?: string;
  to_date?: string;
  status?: string;
}

const Dashboard = () => {
  const title = 'Dashboard'
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const [revenue, setRevenue] = useState(0)
  const [prevRevenue, setPrevRevenue] = useState(0)
  const [orders, setOrders] = useState(0)
  const [prevOrders, setPrevOrders] = useState(0)
  const [products, setProducts] = useState(0)
  const [prevProducts, setPrevProducts] = useState(0)
  const [customers, setCustomers] = useState(0)
  const [prevCustomers, setPrevCustomers] = useState(0)
  const [revenueData, setRevenueData] = useState<IRevenueData[]>()
  const [invoices, setInvoices] = useState<IInvoice[]>()
  const [invoiceStatus, setInvoiceStatus] = useState('1')

  async function fetchDashboard() {
    try {
      const response = await axios.get(`/api/v1/dashboard/`, {
        params: {
          from_date: date?.from ? format(date?.from, 'yyyy-MM-dd') : undefined,
          to_date: date?.to ? format(date?.to, 'yyyy-MM-dd') : undefined,
          period: chartPeriod
        }
      });
      setRevenue(response.data.data.revenue)
      setPrevRevenue(response.data.data.previous_revenue)

      setOrders(response.data.data.approved_orders)
      setPrevOrders(response.data.data.previous_approved_orders)

      setProducts(response.data.data.products_sold)
      setPrevProducts(response.data.data.previous_products_sold)

      setCustomers(response.data.data.customers)
      setPrevCustomers(response.data.data.previous_customers)

      setRevenueData(response.data.data.sales_timeseries)
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Terjadi kesalahan',
        })
      }
    }
  }

  async function fetchInvoices() {
    try {
      let params: InvoiceParams = {
        columns: 'id,customer,total',
        from_date: date?.from ? format(date?.from, 'yyyy-MM-dd') : undefined,
        to_date: date?.to ? format(date?.to, 'yyyy-MM-dd') : undefined,
      };

      if (invoiceStatus === '0' || invoiceStatus === '1') {
        params.status = invoiceStatus;
      }
      const response = await axios.get(`/api/v1/invoices/`, { params });
      setInvoices(response.data.data)
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Terjadi kesalahan',
        })
      }
    }
  }

  useEffect(() => {
    if (!date) return
    fetchDashboard()
    fetchInvoices()
  }, [date, chartPeriod])

  useEffect(() => {
    fetchInvoices()
  }, [invoiceStatus])

  return (
    <AppLayout
      title={title}
      headerAction={
        <CalendarDateRangePicker onChange={setDate} />
      }
    >
      <ContentLayout className="sm:my-12 sm:mx-6 lg:mx-8 py-8 px-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              icon={
                <div className="bg-blue-500/15 border border-blue-500/15 w-9 h-9 flex justify-center items-center rounded-md shadow-xl shadow-blue-500/60">
                  <p className="text-blue-500 font-bold">Rp</p>
                </div>
              }
              title="Total Pendapatan"
              data={currencyFormatter(revenue)}
              trend={prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : null}
            />
            <DashboardCard
              icon={
                <div className="bg-green-500/15 border border-green-500/15 w-9 h-9 flex justify-center items-center rounded-md shadow-xl shadow-green-500/60">
                  <CreditCardIcon size="24" className="text-green-500" />
                </div>
              }
              title="Pesanan"
              data={String(orders)}
              trend={prevOrders ? ((orders - prevOrders) / prevOrders) * 100 : null}
            />

            <DashboardCard
              icon={
                <div className="bg-purple-500/15 border border-purple-500/15 w-9 h-9 flex justify-center items-center rounded-md shadow-xl shadow-purple-500/60">
                  <ShoppingBagIcon size="24" className="text-purple-500" />
                </div>
              }
              title="Produk Terjual"
              data={String(products)}
              trend={prevProducts ? ((products - prevProducts) / prevProducts) * 100 : null}
            />

            <DashboardCard
              icon={
                <div className="bg-red-500/15 border border-red-500/15 w-9 h-9 flex justify-center items-center rounded-md shadow-xl shadow-red-500/60">
                  <Users2Icon size="24" className="text-red-500" />
                </div>
              }
              title="Customer"
              data={customers.toString()}
              trend={prevCustomers ? ((customers - prevCustomers) / prevCustomers) * 100 : null}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col w-full md:w-2/3 bg-zinc-50 shadow-md dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div className="flex flex-row justify-between items-center border-0 border-b-2 py-4 px-4 dark:border-zinc-800">
                <h2 className="text-md font-semibold">Statistik Pendapatan</h2>
                <ToggleGroup value={chartPeriod} type="single" size="default" onValueChange={(value: "daily" | "monthly" | "yearly") => setChartPeriod(value)}>
                  <ToggleGroupItem value="daily" aria-label="Toggle daily">
                    1D
                  </ToggleGroupItem>
                  <ToggleGroupItem value="monthly" aria-label="Toggle monthly">
                    1M
                  </ToggleGroupItem>
                  <ToggleGroupItem value="yearly" aria-label="Toggle chart">
                    1Y
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="h-96 py-8 pl-0">
                {revenueData && (
                  <RevenueChart data={revenueData} period={chartPeriod} />
                )}
              </div>
            </div>
            <div className="flex flex-col w-full md:w-1/3 bg-zinc-50 shadow-md dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div className="flex flex-row gap-4 justify-between items-center border-0 border-b-2 py-4 px-4 dark:border-zinc-800">
                <h2 className="text-md font-semibold">Penjualan</h2>
                <Select
                  value={invoiceStatus}
                  onValueChange={(value) => setInvoiceStatus(value)}
                >
                  <SelectTrigger className="w-[100px] truncate">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent ref={(ref) => {
                    if (!ref) return;
                    ref.ontouchstart = (e) => {
                      e.preventDefault();
                    }
                  }}>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Disetujui</SelectItem>
                      <SelectItem value="2">Semua</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {invoices && invoices.length > 0 ? (
                <ScrollArea className="h-96">
                  {invoices?.map((invoice, index) => (
                    <div key={index} className="grid grid-cols-1 divide-y dark:divide-zinc-800">
                      <Link href={`/invoices/${invoice.id}`} className="flex flex-col xs:flex-row justify-center gap-2 xs:justify-between px-4 py-2 border-0 border-b-[1px] dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                        <div>
                          <p className="text-xs font-semibold">{invoice.customer.company_name}</p>
                          <p className="text-xs">{invoice.customer.email}</p>
                        </div>
                        <p className="text-sm text-right">{currencyFormatter(invoice.total)}</p>
                      </Link>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="flex flex-col justify-center items-center h-96">
                  <p className="text-sm text-zinc-800 dark:text-zinc-500">Tidak ada penjualan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    </AppLayout>
  )
}

export default withProtected(Dashboard)
