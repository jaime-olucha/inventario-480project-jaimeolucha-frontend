import type { LinkDTO } from "@/infrastructure/dtos/Project/LinkDTO"
import type { Link } from "../../domain/models/Project/Link"
import type { TechnologyDTO } from "@/infrastructure/dtos/Project/TechnologyDTO"
import type { DevelopmentDTO } from "@/infrastructure/dtos/Project/DevelopmentDTO"
import type { Technology } from "../../domain/models/Project/Technology"
import type { Development } from "../../domain/models/Project/Development"

export const mapLink = (dto: LinkDTO): Link => ({
  id: dto.id,
  environment: dto.environment,
  url: dto.url
})

export const mapTechnology = (dto: TechnologyDTO): Technology => ({
  id: dto.id,
  name: dto.name
})

export const mapDevelopment = (dto: DevelopmentDTO): Development => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  technology: mapTechnology(dto.technology),
  urlRepository: dto.url_Repository,
  links: dto.links.map(mapLink),
})