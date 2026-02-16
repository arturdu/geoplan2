// ============================================================
// EKZ MVP - Mock Data
// ============================================================

import type {
  Activity,
  Asgroup,
  Client,
  Contractor,
  EdzrgTask,
  Idea,
  Notification,
  Order,
  OrderMedia,
  Post,
  Project,
  ProjectFile,
  ProjectLink,
  Survey,
  Team,
  Trade,
  Type,
  User,
  WeatherData,
  WorkType,
} from '@/types'

// ── Teams ──────────────────────────────────────────────
export const teams: Team[] = [
  { id: 1, name: 'Geoplan Krakow', short: 'GK', website_url: 'https://geoplan-krakow.pl', company_address: 'ul. Florianska 12, 31-021 Krakow', logo_url: null, orders_count: 87, users_count: 12, created_at: '2023-01-15' },
  { id: 2, name: 'GeoService Warszawa', short: 'GS', website_url: 'https://geoservice.pl', company_address: 'ul. Marszalkowska 45, 00-648 Warszawa', logo_url: null, orders_count: 45, users_count: 8, created_at: '2023-03-20' },
  { id: 3, name: 'MeasurePro Gdansk', short: 'MP', website_url: 'https://measurepro.pl', company_address: 'ul. Dluga 78, 80-831 Gdansk', logo_url: null, orders_count: 18, users_count: 5, created_at: '2024-01-10' },
]

// ── Contractors ────────────────────────────────────────
export const contractors: Contractor[] = [
  { id: 1, name: 'BudMont Sp. z o.o.', short: 'BudMont', info: 'Generalne wykonawstwo budowlane', project_ids: [1, 2, 3], orders_count: 42, users_count: 4, team_id: 1, created_at: '2023-02-10' },
  { id: 2, name: 'DrogPol S.A.', short: 'DrogPol', info: 'Budowa i utrzymanie drog', project_ids: [1, 4, 5], orders_count: 35, users_count: 3, team_id: 1, created_at: '2023-02-15' },
  { id: 3, name: 'InfraBud Sp. z o.o.', short: 'InfraBud', info: 'Infrastruktura podziemna', project_ids: [2, 6], orders_count: 28, users_count: 3, team_id: 1, created_at: '2023-04-01' },
  { id: 4, name: 'MostProjekt S.A.', short: 'MostProjekt', info: 'Projektowanie i budowa mostow', project_ids: [3, 7], orders_count: 25, users_count: 3, team_id: 2, created_at: '2023-05-12' },
  { id: 5, name: 'KonBud Sp. z o.o.', short: 'KonBud', info: 'Budownictwo kolejowe', project_ids: [5, 8], orders_count: 20, users_count: 2, team_id: 2, created_at: '2023-08-20' },
]

// ── Projects ───────────────────────────────────────────
export const projects: Project[] = [
  { id: 1, name: 'S7 Krakow - Myslenice', info: 'Budowa drogi ekspresowej S7 odcinek Krakow-Myslenice', team_id: 1, deadline: '17:00', deadline_active: true, min_date: '2023-01-01', lon: 19.9449, lat: 50.0647, open_weather_active: true, orders_count: 32, completed: null, closed: null, created_at: '2023-01-20', inspector_ids: [21, 22] },
  { id: 2, name: 'Obwodnica Zatora', info: 'Budowa obwodnicy miasta Zator', team_id: 1, deadline: '16:00', deadline_active: true, min_date: '2023-03-01', lon: 19.4345, lat: 49.9933, open_weather_active: true, orders_count: 18, completed: null, closed: null, created_at: '2023-03-15', inspector_ids: [21] },
  { id: 3, name: 'Most na Wisle - Nowy Sacz', info: 'Budowa mostu drogowego przez Wisle', team_id: 1, deadline: '16:30', deadline_active: true, min_date: '2023-06-01', lon: 20.6930, lat: 49.6250, open_weather_active: true, orders_count: 15, completed: null, closed: null, created_at: '2023-06-10', inspector_ids: [22] },
  { id: 4, name: 'S19 Lublin - Rzeszow', info: 'Budowa drogi ekspresowej S19', team_id: 1, deadline: '17:00', deadline_active: true, min_date: '2023-02-01', lon: 22.5684, lat: 51.2465, open_weather_active: false, orders_count: 12, completed: null, closed: null, created_at: '2023-02-28', inspector_ids: [] },
  { id: 5, name: 'Modernizacja LK91 Krakow-Medyka', info: 'Modernizacja linii kolejowej nr 91', team_id: 2, deadline: '15:00', deadline_active: true, min_date: '2023-04-01', lon: 19.9449, lat: 50.0647, open_weather_active: true, orders_count: 5, completed: null, closed: null, created_at: '2023-04-15', inspector_ids: [23] },
  { id: 6, name: 'Kanalizacja Wieliczka', info: 'Budowa sieci kanalizacyjnej w gminie Wieliczka', team_id: 1, deadline: '16:00', deadline_active: false, min_date: '2023-07-01', lon: 20.0640, lat: 49.9872, open_weather_active: false, orders_count: 5, completed: null, closed: null, created_at: '2023-07-20', inspector_ids: [] },
  { id: 7, name: 'DK28 Zywiec-Sucha Beskidzka', info: 'Przebudowa drogi krajowej nr 28', team_id: 2, deadline: '17:00', deadline_active: false, min_date: '2023-09-01', lon: 19.1922, lat: 49.6853, open_weather_active: false, orders_count: 0, completed: '2025-06-15', closed: null, created_at: '2023-09-05', inspector_ids: [24] },
  { id: 8, name: 'Wodociag Skawina', info: 'Budowa wodociagu w gminie Skawina', team_id: 2, deadline: '16:00', deadline_active: false, min_date: '2024-01-01', lon: 19.8287, lat: 49.9744, open_weather_active: false, orders_count: 0, completed: '2025-03-01', closed: '2025-09-01', created_at: '2024-01-15', inspector_ids: [] },
]

// ── Trades ──────────────────────────────────────────────
export const trades: Trade[] = [
  { id: 1, name: 'Drogi', definition: 'Prace geodezyjne zwiazane z budowa drog', orders_count: 52, icon: 'tabler-road' },
  { id: 2, name: 'Mosty', definition: 'Prace geodezyjne na obiektach mostowych', orders_count: 28, icon: 'tabler-bridge' },
  { id: 3, name: 'Kolej', definition: 'Prace geodezyjne na liniach kolejowych', orders_count: 18, icon: 'tabler-train' },
  { id: 4, name: 'Kanalizacja', definition: 'Geodezja sieci kanalizacyjnych', orders_count: 22, icon: 'tabler-droplet' },
  { id: 5, name: 'Wodociag', definition: 'Geodezja sieci wodociagowych', orders_count: 15, icon: 'tabler-droplet' },
  { id: 6, name: 'Energetyka', definition: 'Geodezja sieci energetycznych', orders_count: 15, icon: 'tabler-bolt' },
]

// ── Types ───────────────────────────────────────────────
export const types: Type[] = [
  { id: 1, name: 'Inwentaryzacja', definition: 'Inwentaryzacja powykonawcza obiektow', orders_count: 65, icon: 'tabler-pencil-ruler' },
  { id: 2, name: 'Wytyczenie', definition: 'Wytyczenie obiektow w terenie', orders_count: 45, icon: 'tabler-compass' },
  { id: 3, name: 'Podzial', definition: 'Podzial dzialek i nieruchomosci', orders_count: 25, icon: 'tabler-map-2' },
  { id: 4, name: 'Mapa', definition: 'Wykonanie mapy do celow projektowych', orders_count: 15, icon: 'tabler-ruler-measure' },
]

// ── Asgroups ────────────────────────────────────────────
export const asgroups: Asgroup[] = [
  { id: 1, name: 'Nawierzchnia jezdni', definition: 'Warstwy konstrukcyjne nawierzchni', project_id: 1, orders_count: 12, icon: 'tabler-road' },
  { id: 2, name: 'Kanalizacja deszczowa', definition: 'Siec kanalizacji deszczowej', project_id: 1, orders_count: 8, icon: 'tabler-pipe' },
  { id: 3, name: 'Ogrodzenia i bariery', definition: 'Bariery ochronne i ogrodzenia', project_id: 1, orders_count: 5, icon: 'tabler-fence' },
  { id: 4, name: 'Fundamenty mostu', definition: 'Fundamenty i podpory mostu', project_id: 2, orders_count: 6, icon: 'tabler-wall' },
  { id: 5, name: 'Konstrukcja nawierzchni', definition: 'Nawierzchnia obwodnicy', project_id: 2, orders_count: 7, icon: 'tabler-layers-intersect' },
  { id: 6, name: 'Przesla mostowe', definition: 'Konstrukcja przesla mostu', project_id: 3, orders_count: 4, icon: 'tabler-barrier-block' },
  { id: 7, name: 'Filary mostu', definition: 'Filary i slupki nosne', project_id: 3, orders_count: 5, icon: 'tabler-wall' },
  { id: 8, name: 'Nasypy drogowe', definition: 'Nasypy i wykopy drogowe', project_id: 4, orders_count: 4, icon: 'tabler-traffic-cone' },
  { id: 9, name: 'Tory i rozjazdy', definition: 'Uklad torow i rozjazdow', project_id: 5, orders_count: 3, icon: 'tabler-road' },
  { id: 10, name: 'Kolektory glowne', definition: 'Kolektory glowne kanalizacji', project_id: 6, orders_count: 3, icon: 'tabler-pipe' },
  { id: 11, name: 'Przylaczy kanalizacyjne', definition: 'Przylacza do budynkow', project_id: 6, orders_count: 2, icon: 'tabler-pipe' },
  { id: 12, name: 'Siec wodociagowa', definition: 'Magistrala wodociagowa', project_id: 8, orders_count: 0, icon: 'tabler-antenna-bars-5' },
]

// ── Users ───────────────────────────────────────────────
export const users: User[] = [
  // Surveyors (10)
  { id: 1, full_name: 'Jan Kowalski', first_name: 'Jan', last_name: 'Kowalski', email: 'jan.kowalski@geoplan.pl', phone: '+48 501 234 567', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor', 'team_owner'], contractor_id: null, project_ids: [1, 2, 3, 4], team_id: 1, orders_count: 25, created_at: '2023-01-15', lon: 19.9580, lat: 50.0710, location_updated_at: '2026-02-16T08:45:00' },
  { id: 2, full_name: 'Piotr Nowak', first_name: 'Piotr', last_name: 'Nowak', email: 'piotr.nowak@geoplan.pl', phone: '+48 502 345 678', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [1, 2], team_id: 1, orders_count: 18, created_at: '2023-02-01', lon: 19.4210, lat: 49.9800, location_updated_at: '2026-02-16T09:12:00' },
  { id: 3, full_name: 'Marek Wisniewski', first_name: 'Marek', last_name: 'Wisniewski', email: 'marek.w@geoplan.pl', phone: '+48 503 456 789', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [3, 4], team_id: 1, orders_count: 15, created_at: '2023-03-10', lon: 20.7050, lat: 49.6310, location_updated_at: '2026-02-16T07:30:00' },
  { id: 4, full_name: 'Tomasz Zielinski', first_name: 'Tomasz', last_name: 'Zielinski', email: 'tomasz.z@geoplan.pl', phone: '+48 504 567 890', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [1, 6], team_id: 1, orders_count: 12, created_at: '2023-04-15', lon: 20.0520, lat: 49.9950, location_updated_at: '2026-02-16T10:05:00' },
  { id: 5, full_name: 'Andrzej Lewandowski', first_name: 'Andrzej', last_name: 'Lewandowski', email: 'andrzej.l@geoservice.pl', phone: '+48 505 678 901', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor', 'team_owner'], contractor_id: null, project_ids: [5, 7, 8], team_id: 2, orders_count: 10, created_at: '2023-03-20', lon: 19.9320, lat: 50.0580, location_updated_at: '2026-02-16T08:20:00' },
  { id: 6, full_name: 'Krzysztof Kaminski', first_name: 'Krzysztof', last_name: 'Kaminski', email: 'krzysztof.k@geoservice.pl', phone: '+48 506 789 012', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [5, 7], team_id: 2, orders_count: 8, created_at: '2023-05-01', lon: 19.2050, lat: 49.6920, location_updated_at: '2026-02-16T09:40:00' },
  { id: 7, full_name: 'Michal Wozniak', first_name: 'Michal', last_name: 'Wozniak', email: 'michal.w@measurepro.pl', phone: '+48 507 890 123', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor', 'team_owner'], contractor_id: null, project_ids: [], team_id: 3, orders_count: 5, created_at: '2024-01-10', lon: 19.9600, lat: 50.0500, location_updated_at: '2026-02-16T06:55:00' },
  { id: 8, full_name: 'Adam Dabrowski', first_name: 'Adam', last_name: 'Dabrowski', email: 'adam.d@geoplan.pl', phone: '+48 508 901 234', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [1, 2], team_id: 1, orders_count: 5, created_at: '2023-06-01', lon: 19.5234, lat: 50.0612, location_updated_at: new Date().toISOString() },
  { id: 9, full_name: 'Lukasz Kozlowski', first_name: 'Lukasz', last_name: 'Kozlowski', email: 'lukasz.k@geoservice.pl', phone: '+48 509 012 345', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [8], team_id: 2, orders_count: 2, created_at: '2024-02-15', lon: 19.8400, lat: 49.9810, location_updated_at: '2026-02-16T10:30:00' },
  { id: 10, full_name: 'Stanislaw Jankowski', first_name: 'Stanislaw', last_name: 'Jankowski', email: 'stanislaw.j@measurepro.pl', phone: '+48 510 123 456', type: 'surveyor', avatar_url: null, is_active: true, roles: ['surveyor'], contractor_id: null, project_ids: [], team_id: 3, orders_count: 1, created_at: '2024-03-01', lon: 22.5800, lat: 51.2530, location_updated_at: '2026-02-16T09:00:00' },

  // Contractor users (15)
  { id: 11, full_name: 'Robert Mazur', first_name: 'Robert', last_name: 'Mazur', email: 'r.mazur@budmont.pl', phone: '+48 601 111 222', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_admin'], contractor_id: 1, project_ids: [1, 2, 3], team_id: 1, orders_count: 15, created_at: '2023-02-10' },
  { id: 12, full_name: 'Pawel Krawczyk', first_name: 'Pawel', last_name: 'Krawczyk', email: 'p.krawczyk@budmont.pl', phone: '+48 601 222 333', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 1, project_ids: [1, 2], team_id: 1, orders_count: 12, created_at: '2023-02-15' },
  { id: 13, full_name: 'Grzegorz Wojciechowski', first_name: 'Grzegorz', last_name: 'Wojciechowski', email: 'g.wojciechowski@budmont.pl', phone: '+48 601 333 444', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 1, project_ids: [3], team_id: 1, orders_count: 8, created_at: '2023-03-01' },
  { id: 14, full_name: 'Zbigniew Szymanski', first_name: 'Zbigniew', last_name: 'Szymanski', email: 'z.szymanski@budmont.pl', phone: '+48 601 444 555', type: 'contractor', avatar_url: null, is_active: false, roles: ['contractor_user'], contractor_id: 1, project_ids: [1], team_id: 1, orders_count: 5, created_at: '2023-04-01' },
  { id: 15, full_name: 'Mariusz Wieczorek', first_name: 'Mariusz', last_name: 'Wieczorek', email: 'm.wieczorek@drogpol.pl', phone: '+48 602 111 222', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_admin'], contractor_id: 2, project_ids: [1, 4, 5], team_id: 1, orders_count: 14, created_at: '2023-02-15' },
  { id: 16, full_name: 'Jacek Krol', first_name: 'Jacek', last_name: 'Krol', email: 'j.krol@drogpol.pl', phone: '+48 602 222 333', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 2, project_ids: [1, 4], team_id: 1, orders_count: 10, created_at: '2023-03-01' },
  { id: 17, full_name: 'Rafal Piotrowski', first_name: 'Rafal', last_name: 'Piotrowski', email: 'r.piotrowski@drogpol.pl', phone: '+48 602 333 444', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 2, project_ids: [5], team_id: 1, orders_count: 6, created_at: '2023-05-01' },
  { id: 18, full_name: 'Dariusz Grabowski', first_name: 'Dariusz', last_name: 'Grabowski', email: 'd.grabowski@infrabud.pl', phone: '+48 603 111 222', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_admin'], contractor_id: 3, project_ids: [2, 6], team_id: 1, orders_count: 12, created_at: '2023-04-01' },
  { id: 19, full_name: 'Henryk Walczak', first_name: 'Henryk', last_name: 'Walczak', email: 'h.walczak@infrabud.pl', phone: '+48 603 222 333', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 3, project_ids: [2, 6], team_id: 1, orders_count: 8, created_at: '2023-04-15' },
  { id: 20, full_name: 'Wlodzimierz Sikora', first_name: 'Wlodzimierz', last_name: 'Sikora', email: 'w.sikora@infrabud.pl', phone: '+48 603 333 444', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 3, project_ids: [6], team_id: 1, orders_count: 4, created_at: '2023-06-01' },
  { id: 25, full_name: 'Bogdan Nowicki', first_name: 'Bogdan', last_name: 'Nowicki', email: 'b.nowicki@mostprojekt.pl', phone: '+48 604 111 222', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_admin'], contractor_id: 4, project_ids: [3, 7], team_id: 2, orders_count: 10, created_at: '2023-05-12' },
  { id: 26, full_name: 'Tadeusz Olszewski', first_name: 'Tadeusz', last_name: 'Olszewski', email: 't.olszewski@mostprojekt.pl', phone: '+48 604 222 333', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 4, project_ids: [3], team_id: 2, orders_count: 7, created_at: '2023-06-01' },
  { id: 27, full_name: 'Kazimierz Malinowski', first_name: 'Kazimierz', last_name: 'Malinowski', email: 'k.malinowski@mostprojekt.pl', phone: '+48 604 333 444', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 4, project_ids: [7], team_id: 2, orders_count: 5, created_at: '2023-07-01' },
  { id: 28, full_name: 'Jerzy Adamczyk', first_name: 'Jerzy', last_name: 'Adamczyk', email: 'j.adamczyk@konbud.pl', phone: '+48 605 111 222', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_admin'], contractor_id: 5, project_ids: [5, 8], team_id: 2, orders_count: 8, created_at: '2023-08-20' },
  { id: 29, full_name: 'Eugeniusz Pawlak', first_name: 'Eugeniusz', last_name: 'Pawlak', email: 'e.pawlak@konbud.pl', phone: '+48 605 222 333', type: 'contractor', avatar_url: null, is_active: true, roles: ['contractor_user'], contractor_id: 5, project_ids: [5], team_id: 2, orders_count: 4, created_at: '2023-09-01' },

  // Inspectors (5)
  { id: 21, full_name: 'Wojciech Borkowski', first_name: 'Wojciech', last_name: 'Borkowski', email: 'w.borkowski@ik.pl', phone: '+48 700 111 222', type: 'inspector', avatar_url: null, is_active: true, roles: ['inspector'], contractor_id: null, project_ids: [1, 2], team_id: 1, orders_count: 20, created_at: '2023-01-20' },
  { id: 22, full_name: 'Ryszard Chmielewski', first_name: 'Ryszard', last_name: 'Chmielewski', email: 'r.chmielewski@ik.pl', phone: '+48 700 222 333', type: 'inspector', avatar_url: null, is_active: true, roles: ['inspector'], contractor_id: null, project_ids: [1, 3], team_id: 1, orders_count: 15, created_at: '2023-02-01' },
  { id: 23, full_name: 'Stefan Kubiak', first_name: 'Stefan', last_name: 'Kubiak', email: 's.kubiak@ik.pl', phone: '+48 700 333 444', type: 'inspector', avatar_url: null, is_active: true, roles: ['inspector'], contractor_id: null, project_ids: [5], team_id: 2, orders_count: 5, created_at: '2023-04-15' },
  { id: 24, full_name: 'Wieslaw Dudek', first_name: 'Wieslaw', last_name: 'Dudek', email: 'w.dudek@ik.pl', phone: '+48 700 444 555', type: 'inspector', avatar_url: null, is_active: true, roles: ['inspector'], contractor_id: null, project_ids: [7], team_id: 2, orders_count: 3, created_at: '2023-09-05' },
  { id: 30, full_name: 'Edward Zajac', first_name: 'Edward', last_name: 'Zajac', email: 'e.zajac@ik.pl', phone: '+48 700 555 666', type: 'inspector', avatar_url: null, is_active: true, roles: ['inspector'], contractor_id: null, project_ids: [], team_id: 3, orders_count: 0, created_at: '2024-01-10' },
]

// ── Work Types ──────────────────────────────────────────
export const workTypes: WorkType[] = [
  { id: 1, name: 'Podzial nieruchomosci', description: 'Podzial dzialek i nieruchomosci', tasks_count: 8 },
  { id: 2, name: 'Mapa do celow projektowych', description: 'Opracowanie mapy zasadniczej', tasks_count: 5 },
  { id: 3, name: 'Wytyczenie budynku', description: 'Wytyczenie fundamentow budynku', tasks_count: 4 },
  { id: 4, name: 'Inwentaryzacja budynku', description: 'Inwentaryzacja powykonawcza budynku', tasks_count: 3 },
  { id: 5, name: 'Wznowienie granic', description: 'Wznowienie punktow granicznych', tasks_count: 2 },
  { id: 6, name: 'Rozgraniczenie', description: 'Rozgraniczenie nieruchomosci', tasks_count: 1 },
  { id: 7, name: 'Mapa sytuacyjno-wys.', description: 'Mapa sytuacyjno-wysokosciowa', tasks_count: 1 },
  { id: 8, name: 'Tyczenie sieci', description: 'Tyczenie sieci uzbrojenia terenu', tasks_count: 1 },
]

// ── Clients ─────────────────────────────────────────────
export const clients: Client[] = [
  { id: 1, full_name: 'Anna Kowalczyk', first_name: 'Anna', last_name: 'Kowalczyk', email: 'anna.k@gmail.com', phone: '+48 512 111 222', address: 'ul. Lipowa 5, 30-100 Krakow', company: '', nip: '', tasks_count: 3, created_at: '2023-06-01' },
  { id: 2, full_name: 'Marian Zagorski', first_name: 'Marian', last_name: 'Zagorski', email: 'marian.z@wp.pl', phone: '+48 512 222 333', address: 'ul. Dluga 12, 31-200 Krakow', company: 'Zagorski Bud', nip: '6791234567', tasks_count: 4, created_at: '2023-06-15' },
  { id: 3, full_name: 'Katarzyna Nowak', first_name: 'Katarzyna', last_name: 'Nowak', email: 'k.nowak@onet.pl', phone: '+48 512 333 444', address: 'ul. Kwiatowa 8, 32-005 Niepolomice', company: '', nip: '', tasks_count: 2, created_at: '2023-07-01' },
  { id: 4, full_name: 'Wladyslaw Pietrzak', first_name: 'Wladyslaw', last_name: 'Pietrzak', email: 'w.pietrzak@firma.pl', phone: '+48 512 444 555', address: 'ul. Ogrodowa 15, 30-300 Krakow', company: 'Pietrzak i Synowie', nip: '6791234568', tasks_count: 2, created_at: '2023-08-01' },
  { id: 5, full_name: 'Zofia Wrobel', first_name: 'Zofia', last_name: 'Wrobel', email: 'z.wrobel@gmail.com', phone: '+48 512 555 666', address: 'ul. Parkowa 3, 32-020 Wieliczka', company: '', nip: '', tasks_count: 1, created_at: '2023-09-01' },
  { id: 6, full_name: 'Boguslaw Kaczmarek', first_name: 'Boguslaw', last_name: 'Kaczmarek', email: 'b.kaczmarek@interia.pl', phone: '+48 512 666 777', address: 'ul. Sloneczna 22, 30-500 Krakow', company: 'Kaczmarek Dev', nip: '6791234569', tasks_count: 2, created_at: '2023-09-15' },
  { id: 7, full_name: 'Halina Mazurek', first_name: 'Halina', last_name: 'Mazurek', email: 'h.mazurek@wp.pl', phone: '+48 512 777 888', address: 'ul. Lesna 7, 32-050 Skawina', company: '', nip: '', tasks_count: 1, created_at: '2023-10-01' },
  { id: 8, full_name: 'Czeslaw Blaszczyk', first_name: 'Czeslaw', last_name: 'Blaszczyk', email: 'c.blaszczyk@firma.pl', phone: '+48 512 888 999', address: 'ul. Wolnosci 45, 30-700 Krakow', company: 'Blaszczyk Nieruchomosci', nip: '6791234570', tasks_count: 1, created_at: '2023-10-15' },
  { id: 9, full_name: 'Danuta Jaworska', first_name: 'Danuta', last_name: 'Jaworska', email: 'd.jaworska@gmail.com', phone: '+48 513 111 222', address: 'ul. Polna 18, 32-080 Zabierzow', company: '', nip: '', tasks_count: 1, created_at: '2023-11-01' },
  { id: 10, full_name: 'Jozef Urbanski', first_name: 'Jozef', last_name: 'Urbanski', email: 'j.urbanski@wp.pl', phone: '+48 513 222 333', address: 'ul. Krakowska 90, 32-100 Proszowice', company: 'Urbanski Transport', nip: '6791234571', tasks_count: 1, created_at: '2023-11-15' },
  { id: 11, full_name: 'Irena Gorska', first_name: 'Irena', last_name: 'Gorska', email: 'i.gorska@onet.pl', phone: '+48 513 333 444', address: 'ul. Mickiewicza 5, 30-059 Krakow', company: '', nip: '', tasks_count: 1, created_at: '2023-12-01' },
  { id: 12, full_name: 'Krystyna Kasprzak', first_name: 'Krystyna', last_name: 'Kasprzak', email: 'k.kasprzak@gmail.com', phone: '+48 513 444 555', address: 'ul. Pilsudskiego 33, 31-000 Krakow', company: '', nip: '', tasks_count: 1, created_at: '2024-01-01' },
  { id: 13, full_name: 'Roman Lis', first_name: 'Roman', last_name: 'Lis', email: 'r.lis@interia.pl', phone: '+48 513 555 666', address: 'ul. Jagiellonska 12, 33-300 Nowy Sacz', company: 'Lis Budownictwo', nip: '7341234567', tasks_count: 1, created_at: '2024-01-15' },
  { id: 14, full_name: 'Barbara Szewczyk', first_name: 'Barbara', last_name: 'Szewczyk', email: 'b.szewczyk@wp.pl', phone: '+48 513 666 777', address: 'ul. Topolowa 9, 30-200 Krakow', company: '', nip: '', tasks_count: 1, created_at: '2024-02-01' },
  { id: 15, full_name: 'Mieczyslaw Kubicki', first_name: 'Mieczyslaw', last_name: 'Kubicki', email: 'm.kubicki@firma.pl', phone: '+48 513 777 888', address: 'ul. Reymonta 20, 30-059 Krakow', company: 'Kubicki Invest', nip: '6791234572', tasks_count: 0, created_at: '2024-02-15' },
]

// ── Helper to generate orders ──────────────────────────
function generateOrders(): Order[] {
  const statuses: Array<{ status: Order['status']; weight: number }> = [
    { status: 'completed', weight: 40 },
    { status: 'in_progress', weight: 30 },
    { status: 'pending', weight: 15 },
    { status: 'continuous', weight: 10 },
    { status: 'postponed', weight: 3 },
    { status: 'canceled', weight: 2 },
  ]

  const locations = [
    'km 12+450 - km 12+680, strona lewa',
    'km 5+200 - km 5+350, os jezdni',
    'km 0+100 - km 0+250, strona prawa',
    'km 8+700, wezel Myslenice',
    'km 15+300 - km 15+500, MOP Brzesko',
    'km 3+100, obiekt WD-5',
    'km 22+600 - km 22+800, tunel',
    'km 7+450, przepust fi1200',
    'km 18+200, wiadukt WA-12',
    'km 11+050 - km 11+200, rondo',
    'km 1+500, przejscie dla pieszych',
    'km 9+800 - km 10+100, most MD-3',
    'ul. Krakowska 45, Wieliczka',
    'ul. Dluga 78, rejon skrzyzowania',
    'dz. 245/3 obr. Mydlniki',
    'dz. 112/8 obr. Bronowice',
    'km 2+350, zbiornik retencyjny ZR-1',
    'km 6+100, stacja transformatorowa ST-4',
    'km 14+700 - km 14+900, ekran akustyczny',
    'km 20+000, obiekt MS-8',
  ]

  const descriptions = [
    'Inwentaryzacja powykonawcza warstwy wiazacej nawierzchni jezdni glownej',
    'Wytyczenie osi trasy i krawedzi jezdni wg projektu wykonawczego',
    'Inwentaryzacja kanalizacji deszczowej - kolektor DN800',
    'Wytyczenie fundamentow podpory mostu P3 wg rysunku K-12',
    'Inwentaryzacja ogrodzenia ochronnego typu U-14a',
    'Pomiar odksztalcen przesla mostu - seria nr 5',
    'Wytyczenie osi torow na odcinku szlakowym',
    'Inwentaryzacja sieci wodociagowej DN200 PE',
    'Kontrola geometrii nawierzchni - rownowaga i rownosc',
    'Wytyczenie pali fundamentowych CFA fi800',
    'Inwentaryzacja ekranow akustycznych h=4m',
    'Pomiar osiadania nasypow - seria kontrolna nr 12',
    'Wytyczenie komory przepompowni sciekow KP-3',
    'Inwentaryzacja kabla energetycznego SN 15kV',
    'Kontrola montazu barier ochronnych SP-05',
    'Wytyczenie koryta pod warstwy konstrukcyjne',
    'Inwentaryzacja przylaczy kanalizacyjnych do budynkow',
    'Pomiar profilu poprzecznego wykopu',
    'Wytyczenie slupow trakcyjnych ET wg proj. K-45',
    'Inwentaryzacja obrukownia stozkow obiektu WD-5',
  ]

  const orders: Order[] = []

  for (let i = 1; i <= 150; i++) {
    const rand = Math.random() * 100
    let cumWeight = 0
    let status: Order['status'] = 'pending'
    for (const s of statuses) {
      cumWeight += s.weight
      if (rand < cumWeight) {
        status = s.status
        break
      }
    }

    const projectIdx = i % projects.length
    const project = projects[projectIdx]
    const contractorIdx = i % contractors.length
    const contractor = contractors[contractorIdx]
    const tradeIdx = i % trades.length
    const trade = trades[tradeIdx]
    const typeIdx = i % types.length
    const type = types[typeIdx]

    const contractorUsers = users.filter(u => u.type === 'contractor' && u.contractor_id === contractor.id)

    const contractorUser = contractorUsers.length > 0
      ? contractorUsers[i % contractorUsers.length]
      : users.find(u => u.type === 'contractor')!

    const surveyorUsers = users.filter(u => u.type === 'surveyor' && u.team_id === project.team_id)

    const surveyor = (status === 'completed' || status === 'in_progress') && surveyorUsers.length > 0
      ? surveyorUsers[i % surveyorUsers.length]
      : null

    const inspectorUsers = users.filter(u => u.type === 'inspector' && u.project_ids.includes(project.id))

    const inspector = project.inspector_ids.length > 0 && inspectorUsers.length > 0
      ? inspectorUsers[i % inspectorUsers.length]
      : null

    const hasInspection = inspector && Math.random() < 0.3
    let iStatus: Order['i_status'] = null
    let iCalled: string | null = null
    let inspectedAt: string | null = null
    if (hasInspection) {
      const iStatuses: Order['i_status'][] = ['approved', 'approved_conditionally', 'rejected', 'called']

      iStatus = iStatuses[i % iStatuses.length]
      iCalled = iStatus === 'called' ? `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null
      inspectedAt = iStatus !== 'called' ? `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null
    }

    const createdMonth = ((i - 1) % 24)
    const createdYear = createdMonth < 12 ? 2024 : 2025
    const createdMonthNum = (createdMonth % 12) + 1

    const asgroupsForProject = asgroups.filter(a => a.project_id === project.id)

    const orderAsgroups = asgroupsForProject.length > 0
      ? [asgroupsForProject[i % asgroupsForProject.length]]
      : []

    const media: OrderMedia[] = []
    const mediaCount = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0
    for (let m = 0; m < mediaCount; m++) {
      media.push({
        id: i * 10 + m,
        file_name: `pomiar_${i}_${m + 1}.pdf`,
        file_url: '#',
        created_at: `${createdYear}-${String(createdMonthNum).padStart(2, '0')}-15 10:30`,
        user: { full_name: surveyor?.full_name || 'Jan Kowalski' },
        i_status: hasInspection ? iStatus : null,
        i_visible: true,
      })
    }

    orders.push({
      id: i,
      order_no: `ZLC/${createdYear}/${String(i).padStart(4, '0')}`,
      status,
      i_status: iStatus,
      i_called: iCalled,
      inspected_at: inspectedAt,
      i_notes: hasInspection ? 'Uwaga: sprawdzic punkty kontrolne' : null,
      project_id: project.id,
      project,
      contractor_id: contractor.id,
      contractor,
      contractor_user_id: contractorUser.id,
      contractor_user: contractorUser,
      trade_id: trade.id,
      trade,
      type_id: type.id,
      type,
      asgroup_ids: orderAsgroups.map(a => a.id),
      asgroups: orderAsgroups,
      location: locations[i % locations.length],
      kms: `${(i * 0.5 + 1).toFixed(3)}`,
      dwg_no: `RYS-${String(i).padStart(3, '0')}/WD-${(i % 20) + 1}`,
      description: descriptions[i % descriptions.length],
      company: i % 3 === 0 ? contractor.name : '',
      extra_contact: i % 5 === 0 ? `+48 ${500 + (i % 100)} ${String(i * 111).padStart(3, '0').slice(0, 3)} ${String(i * 222).padStart(3, '0').slice(0, 3)}` : '',
      notes: i % 4 === 0 ? 'Prosze o kontakt przed wyjazdem w teren' : '',
      completion_date: `${createdYear}-${String(createdMonthNum).padStart(2, '0')}-${String(Math.min((i % 28) + 1, 28)).padStart(2, '0')}`,
      surveyor_id: surveyor?.id || null,
      assigned_to: surveyor?.id || null,
      surveyor: surveyor || undefined,
      inspector_id: inspector?.id || null,
      inspector: inspector || undefined,
      execute_date: status === 'completed' ? `${createdYear}-${String(createdMonthNum).padStart(2, '0')}-${String(Math.min((i % 28) + 5, 28)).padStart(2, '0')}` : null,
      survey_no: status === 'completed' ? `OP/${createdYear}/${String(i).padStart(4, '0')}` : null,
      surveyor_notes: status === 'completed' ? 'Wykonano zgodnie ze zleceniem' : '',
      created_at: `${createdYear}-${String(createdMonthNum).padStart(2, '0')}-${String(Math.min((i % 28) + 1, 28)).padStart(2, '0')}`,
      orderMedia: media,
    })
  }

  return orders
}

export const orders: Order[] = generateOrders()

// ── Posts ────────────────────────────────────────────────
export const posts: Post[] = [
  { id: 1, title: 'Nowy kontrakt S7 - rozpoczecie prac', body: '<p>Z przyjemnoscia informujemy o rozpoczeciu prac geodezyjnych na kontrakcie S7 Krakow-Myslenice. Prace ruszaja od poniedzialku.</p>', category: 'contracts', image_urls: [], author: { full_name: 'Jan Kowalski', avatar_url: null }, created_at: '2025-01-15T10:00:00', read: true },
  { id: 2, title: 'Turniej pilki noznej - zaproszenie', body: '<p>Zapraszamy wszystkich pracownikow na turniej pilki noznej, ktory odbedzie sie w sobote na boisku w Bronowicach.</p>', category: 'sport', image_urls: [], author: { full_name: 'Piotr Nowak', avatar_url: null }, created_at: '2025-01-20T14:30:00', read: true },
  { id: 3, title: 'Szkolenie BHP - termin', body: '<p>Przypominamy o obowiazkowym szkoleniu BHP w dniu 5 lutego. Obecnosc obowiazkowa dla wszystkich pracownikow terenowych.</p>', category: 'events', image_urls: [], author: { full_name: 'Jan Kowalski', avatar_url: null }, created_at: '2025-01-25T09:00:00', read: true },
  { id: 4, title: 'Aktualizacja oprogramowania pomiarowego', body: '<p>Informujemy o aktualizacji oprogramowania Leica Infinity do wersji 4.0. Prosimy o aktualizacje na wszystkich stacjach roboczych.</p>', category: 'info', image_urls: [], author: { full_name: 'Andrzej Lewandowski', avatar_url: null }, created_at: '2025-02-01T11:00:00', read: false },
  { id: 5, title: 'Kontrakt Obwodnica Zatora - podsumowanie', body: '<p>Podsumowanie pierwszego kwartalu prac na kontrakcie Obwodnica Zatora. Wykonano 85% zaplanowanych pomiarow.</p>', category: 'contracts', image_urls: [], author: { full_name: 'Marek Wisniewski', avatar_url: null }, created_at: '2025-02-05T16:00:00', read: false },
  { id: 6, title: 'Wigilia firmowa 2025', body: '<p>Zapraszamy na wieczorek wigilijny w restauracji Pod Baranem. Zapisy u Piotra do konca tygodnia.</p>', category: 'events', image_urls: [], author: { full_name: 'Piotr Nowak', avatar_url: null }, created_at: '2025-02-10T12:00:00', read: false },
  { id: 7, title: 'Nowe tachimetry Leica TS16', body: '<p>Zakupilismy 3 nowe tachimetry Leica TS16 1". Dostepne do rezerwacji od przyszlego tygodnia.</p>', category: 'info', image_urls: [], author: { full_name: 'Jan Kowalski', avatar_url: null }, created_at: '2025-02-12T08:30:00', read: false },
  { id: 8, title: 'Rajd rowerowy - trasa Krakow-Ojcow', body: '<p>Organizujemy rajd rowerowy na trasie Krakow-Ojcow w pierwsza sobote marca. Zbiorna na Rynku o 8:00.</p>', category: 'sport', image_urls: [], author: { full_name: 'Tomasz Zielinski', avatar_url: null }, created_at: '2025-02-14T15:00:00', read: false },
  { id: 9, title: 'Zmiana godzin pracy biura', body: '<p>Od marca biuro bedzie czynne w godzinach 7:00-15:00 (zamiast 8:00-16:00). Prosimy o dostosowanie.</p>', category: 'other', image_urls: [], author: { full_name: 'Jan Kowalski', avatar_url: null }, created_at: '2025-02-15T09:00:00', read: false },
  { id: 10, title: 'Kontrakt Most na Wisle - kamien milowy', body: '<p>Osiagnelismy wazny kamien milowy - zakonczono pomiary fundamentow wszystkich podpor mostu.</p>', category: 'contracts', image_urls: [], author: { full_name: 'Marek Wisniewski', avatar_url: null }, created_at: '2025-02-15T14:00:00', read: false },
]

// ── Ideas ───────────────────────────────────────────────
export const ideas: Idea[] = [
  { id: 1, title: 'Automatyczne powiadomienia SMS', description: 'Wysylanie SMS do wykonawcow po zmianie statusu zlecenia', status: 'considering', created_at: '2025-01-10' },
  { id: 2, title: 'Eksport do GeoJSON', description: 'Mozliwosc eksportu lokalizacji zlecen do formatu GeoJSON', status: 'considering', created_at: '2025-01-12' },
  { id: 3, title: 'Panel mobilny dla geodetow', description: 'Dedykowana aplikacja mobilna do zarzadzania zleceniami w terenie', status: 'considering', created_at: '2025-01-15' },
  { id: 4, title: 'Integracja z GEOPORTAL', description: 'Automatyczne pobieranie danych z Geoportalu', status: 'considering', created_at: '2025-01-20' },
  { id: 5, title: 'Kalendarz zlecen', description: 'Widok kalendarza z zaplanowanymi zleceniami', status: 'under', created_at: '2025-01-05' },
  { id: 6, title: 'Szablony zlecen', description: 'Mozliwosc tworzenia szablonow zlecen dla powtarzalnych prac', status: 'under', created_at: '2025-01-08' },
  { id: 7, title: 'Dashboard z mapami', description: 'Interaktywna mapa z lokalizacjami aktywnych kontraktow', status: 'under', created_at: '2025-01-18' },
  { id: 8, title: 'Raport miesieczny PDF', description: 'Automatyczne generowanie raportow miesiecznych w PDF', status: 'under', created_at: '2025-01-22' },
  { id: 9, title: 'Ciemny motyw', description: 'Wsparcie dla ciemnego motywu w aplikacji', status: 'implemented', created_at: '2024-11-01' },
  { id: 10, title: 'Filtrowanie kolumn tabeli', description: 'Mozliwosc filtrowania po kazdej kolumnie tabeli', status: 'implemented', created_at: '2024-10-15' },
  { id: 11, title: 'Eksport do Excel', description: 'Eksport danych z tabel do formatu XLSX', status: 'implemented', created_at: '2024-09-01' },
  { id: 12, title: 'Powiadomienia push', description: 'Powiadomienia push w przegladarce', status: 'implemented', created_at: '2024-08-15' },
  { id: 13, title: 'Statystyki roczne', description: 'Roczne zestawienie statystyk zespolu', status: 'closed', created_at: '2024-06-01' },
  { id: 14, title: 'Integracja z Dropbox', description: 'Synchronizacja plikow z Dropbox - zastapione wlasnym systemem', status: 'closed', created_at: '2024-05-01' },
  { id: 15, title: 'Czat wewnetrzny', description: 'Wewnetrzny system wiadomosci - zrezygnowano na rzecz MS Teams', status: 'closed', created_at: '2024-04-01' },
]

// ── Project Files ───────────────────────────────────────
export const projectFiles: ProjectFile[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  project_id: projects[i % projects.length].id,
  project: projects[i % projects.length],
  file_name: [
    'projekt_wykonawczy_drogi.pdf',
    'specyfikacja_techniczna.pdf',
    'harmonogram_prac.xlsx',
    'mapa_zasadnicza.dwg',
    'profil_podluzny.pdf',
    'przekroj_normalny.pdf',
    'dokumentacja_fotograficzna.pdf',
    'protokol_odbioru.pdf',
    'raport_pomiarowy.pdf',
    'kosztorys_wykonawczy.xlsx',
    'plan_BIOZ.pdf',
    'decyzja_ZRID.pdf',
    'opinia_geotechniczna.pdf',
    'projekt_tymczasowej_org_ruchu.pdf',
    'rejestr_zmian.xlsx',
    'dziennik_budowy_skan.pdf',
    'karta_materialowa.pdf',
    'certyfikat_materialow.pdf',
    'schemat_organizacyjny.pdf',
    'plan_jakosci.pdf',
  ][i],
  file_url: '#',
  description: 'Dokument projektowy',
  user: { full_name: users[i % 5].full_name },
  created_at: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}))

// ── Project Links ───────────────────────────────────────
export const projectLinks: ProjectLink[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  project_id: projects[i % projects.length].id,
  project: projects[i % projects.length],
  url: [
    'https://geoportal.gov.pl',
    'https://mapy.geoportal.gov.pl',
    'https://geoplan-krakow.pl/dokumenty',
    'https://drive.google.com/drive/folders/abc123',
    'https://teams.microsoft.com/channel/xyz',
    'https://github.com/geoplan/s7-projekt',
    'https://jira.geoplan.pl/project/S7',
    'https://confluence.geoplan.pl/display/S7',
    'https://meteo.imgw.pl',
    'https://mapa.targeo.pl',
    'https://gis.krakow.pl',
    'https://mpzp.krakow.pl',
    'https://geoforum.pl',
    'https://geodeta.pl',
    'https://geoservice.pl/pomiary',
    'https://leica-geosystems.com',
    'https://trimble.com',
    'https://topcon.com',
    'https://oscgis.pl',
    'https://qgis.org',
  ][i],
  description: [
    'Geoportal krajowy',
    'Mapy Geoportal',
    'Dokumentacja projektowa',
    'Dysk Google zespolu',
    'Kanal MS Teams',
    'Repozytorium kodu',
    'Tablica Jira',
    'Dokumentacja Confluence',
    'Pogoda IMGW',
    'Mapa drogowa',
    'GIS Krakow',
    'MPZP Krakow',
    'Forum geodezyjne',
    'Portal geodeta.pl',
    'Portal pomiarowy',
    'Leica Geosystems',
    'Trimble',
    'Topcon',
    'OSC GIS',
    'QGIS',
  ][i],
  user: { full_name: users[i % 5].full_name },
  created_at: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}))

// ── Surveys ─────────────────────────────────────────────
export const surveys: Survey[] = Array.from({ length: 15 }, (_, i) => {
  const project = projects[i % 6]
  const surveyorsList = users.filter(u => u.type === 'surveyor' && u.team_id === project.team_id)
  const surv = surveyorsList.length > 0 ? surveyorsList[i % surveyorsList.length] : users[0]

  return {
    id: i + 1,
    project_id: project.id,
    project,
    file_name: `OPERAT_${String(i + 1).padStart(3, '0')}_${project.name.replace(/\s/g, '_').substring(0, 15)}.pdf`,
    file_url: '#',
    user: { full_name: surv.full_name },
    trade_id: trades[i % trades.length].id,
    trade: trades[i % trades.length],
    asgroup_id: asgroups.filter(a => a.project_id === project.id)[0]?.id || null,
    asgroup: asgroups.filter(a => a.project_id === project.id)[0] || undefined,
    surveyor_id: surv.id,
    surveyor: surv,
    i_status: i % 4 === 0 ? 'approved' : i % 4 === 1 ? 'approved_conditionally' : i % 4 === 2 ? 'rejected' : null,
    created_at: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  }
})

// ── EDZRG Tasks ─────────────────────────────────────────
export const edzrgTasks: EdzrgTask[] = Array.from({ length: 25 }, (_, i) => {
  const priorities: EdzrgTask['priority'][] = ['niski', 'standard', 'standard', 'wysoki', 'hiper']
  const work = workTypes[i % workTypes.length]
  const client = clients[i % clients.length]
  const surveyorsList = users.filter(u => u.type === 'surveyor')
  const surv = surveyorsList[i % surveyorsList.length]

  return {
    id: i + 1,
    task_no: `EDZ/${2025}/${String(i + 1).padStart(4, '0')}`,
    priority: priorities[i % priorities.length],
    work_id: work.id,
    work,
    client_id: client.id,
    client,
    powiat: 'krakowski',
    miasto: ['Krakow', 'Wieliczka', 'Skawina', 'Niepolomice', 'Zabierzow'][i % 5],
    gmina: ['Krakow', 'Wieliczka', 'Skawina', 'Niepolomice', 'Zabierzow'][i % 5],
    obreb: `Obreb ${i + 1}`,
    plot_no: `${100 + i}/${(i % 10) + 1}`,
    ulica: ['ul. Lipowa', 'ul. Dluga', 'ul. Kwiatowa', 'ul. Sloneczna', 'ul. Parkowa'][i % 5],
    kodgik: `K.${6510 + i}.${2025}.${String(i + 1).padStart(4, '0')}`,
    net: Math.round((1000 + i * 200) * 100) / 100,
    vat: 23,
    gross: Math.round((1000 + i * 200) * 1.23 * 100) / 100,
    info: i % 3 === 0 ? 'Pilne - termin do konca miesiaca' : '',
    reported: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
    measurements: i > 5 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-10` : null,
    measurements_surveyor_id: i > 5 ? surv.id : null,
    measurements_surveyor: i > 5 ? surv : undefined,
    study: i > 10 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-15` : null,
    study_performer_id: i > 10 ? surv.id : null,
    study_performer: i > 10 ? surv : undefined,
    field: i > 12 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-18` : null,
    handed: i > 15 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-20` : null,
    picked: i > 18 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-22` : null,
    received: i > 20 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-25` : null,
    paid: i > 22 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-28` : null,
    attachments: i % 4 === 0 ? [`pomiar_${i + 1}.pdf`] : [],
    creator: { full_name: surv.full_name },
    created_at: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }
})

// ── Weather Data ────────────────────────────────────────
export const weatherData: WeatherData[] = projects.filter(p => p.open_weather_active && !p.closed).map(p => ({
  project_name: p.name,
  current: {
    temp: Math.round(-5 + Math.random() * 15),
    icon: ['01d', '02d', '03d', '04d', '09d', '10d', '13d'][Math.floor(Math.random() * 7)],
    description: ['Słonecznie', 'Lekkie zachmurzenie', 'Pochmurno', 'Deszcz', 'Śnieg', 'Mgła'][Math.floor(Math.random() * 6)],
    humidity: Math.round(40 + Math.random() * 50),
    wind: Math.round(2 + Math.random() * 15),
  },
  forecast: Array.from({ length: 5 }, (_, j) => ({
    day: ['Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob', 'Nd'][(new Date().getDay() + j) % 7],
    temp: Math.round(-5 + Math.random() * 15),
    icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)],
  })),
}))

// ── Activities ──────────────────────────────────────────
export const activities: Activity[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  type: ['order_created', 'order_updated', 'status_changed', 'file_uploaded', 'comment_added', 'user_login'][i % 6],
  description: [
    `Utworzono zlecenie ZLC/2025/${String(i + 1).padStart(4, '0')}`,
    `Zaktualizowano zlecenie ZLC/2025/${String(i + 1).padStart(4, '0')}`,
    'Zmieniono status zlecenia na "Wykonane"',
    `Dodano plik pomiar_${i + 1}.pdf`,
    'Dodano komentarz do zlecenia',
    'Uzytkownik zalogowal sie do systemu',
  ][i % 6],
  user: { full_name: users[i % users.length].full_name },
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
}))

// ── Notifications ───────────────────────────────────────
export const notifications: Notification[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: [
    'Nowe zlecenie',
    'Zmiana statusu',
    'Nowy plik',
    'Komentarz',
    'Termin zlecenia',
    'Nowy uzytkownik',
  ][i % 6],
  body: [
    'Otrzymales nowe zlecenie do realizacji',
    'Status zlecenia zostal zmieniony na "Wykonane"',
    'Dodano nowy plik do zlecenia',
    'Nowy komentarz w zleceniu',
    'Zbliia sie termin realizacji zlecenia',
    'Nowy uzytkownik dolaczyl do zespolu',
  ][i % 6],
  read: i > 5,
  created_at: new Date(Date.now() - i * 7200000).toISOString(),
}))
