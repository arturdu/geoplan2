// ============================================================
// EKZ MVP - TypeScript Types
// ============================================================

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'continuous' | 'canceled'
export type InspectorStatus = 'approved' | 'approved_conditionally' | 'rejected' | 'called' | null
export type UserType = 'surveyor' | 'contractor' | 'inspector'
export type PanelType = 'app' | 'surveyor' | 'contractor' | 'admin'
export type IdeaStatus = 'considering' | 'under' | 'implemented' | 'closed'
export type PostCategory = 'contracts' | 'sport' | 'events' | 'info' | 'other'
export type TaskPriority = 'niski' | 'standard' | 'wysoki' | 'hiper'

export interface Team {
  id: number
  name: string
  short: string
  website_url: string
  company_address: string
  logo_url: string | null
  orders_count: number
  users_count: number
  created_at: string
}

export interface User {
  id: number
  full_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  type: UserType
  avatar_url: string | null
  is_active: boolean
  roles: string[]
  contractor_id: number | null
  contractor?: Contractor
  project_ids: number[]
  team_id: number
  orders_count: number
  created_at: string
  lon?: number
  lat?: number
  location_updated_at?: string
}

export interface Project {
  id: number
  name: string
  info: string
  team_id: number
  deadline: string
  deadline_active: boolean
  min_date: string
  lon: number
  lat: number
  open_weather_active: boolean
  orders_count: number
  completed: string | null
  closed: string | null
  created_at: string
  inspector_ids: number[]
}

export interface Contractor {
  id: number
  name: string
  short: string
  info: string
  project_ids: number[]
  orders_count: number
  users_count: number
  team_id: number
  created_at: string
}

export interface Trade {
  id: number
  name: string
  definition: string
  orders_count: number
  icon?: string
}

export interface Type {
  id: number
  name: string
  definition: string
  orders_count: number
  icon?: string
}

export interface Asgroup {
  id: number
  name: string
  definition: string
  project_id: number
  project?: Project
  orders_count: number
  icon?: string
}

export interface OrderMedia {
  id: number
  file_name: string
  file_url: string
  created_at: string
  user: { full_name: string }
  i_status: InspectorStatus
  i_visible: boolean
}

export interface Order {
  id: number
  order_no: string
  status: OrderStatus
  i_status: InspectorStatus
  i_called: string | null
  inspected_at: string | null
  i_notes: string | null
  project_id: number
  project?: Project
  contractor_id: number
  contractor?: Contractor
  contractor_user_id: number
  contractor_user?: User
  trade_id: number
  trade?: Trade
  type_id: number
  type?: Type
  asgroup_ids: number[]
  asgroups?: Asgroup[]
  location: string
  kms: string
  dwg_no: string
  description: string
  company: string
  extra_contact: string
  notes: string
  completion_date: string
  surveyor_id: number | null
  assigned_to: number | null
  surveyor?: User
  inspector_id: number | null
  inspector?: User
  execute_date: string | null
  survey_no: string | null
  surveyor_notes: string
  created_at: string
  orderMedia: OrderMedia[]
}

export interface Post {
  id: number
  title: string
  body: string
  category: PostCategory
  image_urls: string[]
  author: { full_name: string; avatar_url: string | null }
  created_at: string
  read?: boolean
}

export interface Idea {
  id: number
  title: string
  description: string
  status: IdeaStatus
  created_at: string
}

export interface ProjectFile {
  id: number
  project_id: number
  project?: Project
  file_name: string
  file_url: string
  description: string
  user: { full_name: string }
  created_at: string
}

export interface ProjectLink {
  id: number
  project_id: number
  project?: Project
  url: string
  description: string
  user: { full_name: string }
  created_at: string
}

export interface Survey {
  id: number
  project_id: number
  project?: Project
  file_name: string
  file_url: string
  user: { full_name: string }
  trade_id: number
  trade?: Trade
  asgroup_id: number | null
  asgroup?: Asgroup
  surveyor_id: number | null
  surveyor?: User
  i_status: InspectorStatus
  created_at: string
}

export interface Client {
  id: number
  full_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  company: string
  nip: string
  tasks_count: number
  created_at: string
}

export interface WorkType {
  id: number
  name: string
  description: string
  tasks_count: number
}

export interface EdzrgTask {
  id: number
  task_no: string
  priority: TaskPriority
  work_id: number
  work?: WorkType
  client_id: number
  client?: Client
  powiat: string
  miasto: string
  gmina: string
  obreb: string
  plot_no: string
  ulica: string
  kodgik: string
  net: number
  vat: number
  gross: number
  info: string
  reported: string | null
  measurements: string | null
  measurements_surveyor_id: number | null
  measurements_surveyor?: User
  study: string | null
  study_performer_id: number | null
  study_performer?: User
  field: string | null
  handed: string | null
  picked: string | null
  received: string | null
  paid: string | null
  attachments: string[]
  creator: { full_name: string }
  created_at: string
}

export interface Activity {
  id: number
  type: string
  description: string
  user: { full_name: string }
  created_at: string
}

export interface Notification {
  id: number
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface WeatherData {
  project_name: string
  current: {
    temp: number
    icon: string
    description: string
    humidity: number
    wind: number
  }
  forecast: Array<{
    day: string
    temp: number
    icon: string
  }>
}

// Status color maps
export const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'grey',
  in_progress: 'info',
  completed: 'success',
  postponed: 'warning',
  continuous: 'primary',
  canceled: 'error',
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Oczekujące',
  in_progress: 'W realizacji',
  completed: 'Wykonane',
  postponed: 'Odłożone',
  continuous: 'Ciągłe',
  canceled: 'Anulowane',
}

export const inspectorStatusColors: Record<string, string> = {
  approved: 'success',
  approved_conditionally: 'warning',
  rejected: 'error',
  called: 'info',
}

export const inspectorStatusLabels: Record<string, string> = {
  approved: 'Zatwierdzone',
  approved_conditionally: 'Warunkowo',
  rejected: 'Odrzucone',
  called: 'Przekazane',
}

export const postCategoryColors: Record<PostCategory, string> = {
  contracts: 'primary',
  sport: 'info',
  events: 'success',
  info: 'secondary',
  other: 'warning',
}

export const postCategoryLabels: Record<PostCategory, string> = {
  contracts: 'Kontrakty',
  sport: 'Sport',
  events: 'Wydarzenia',
  info: 'Informacje',
  other: 'Inne',
}

export const taskPriorityColors: Record<TaskPriority, string> = {
  niski: 'secondary',
  standard: 'info',
  wysoki: 'warning',
  hiper: 'error',
}

export const ideaStatusConfig: Record<IdeaStatus, { label: string; color: string; icon: string }> = {
  considering: { label: 'Propozycje', color: 'primary', icon: 'tabler-flask' },
  under: { label: 'W realizacji', color: 'warning', icon: 'tabler-settings' },
  implemented: { label: 'Zrealizowane', color: 'success', icon: 'tabler-circle-check' },
  closed: { label: 'Zamkniete', color: 'secondary', icon: 'tabler-eye-off' },
}
