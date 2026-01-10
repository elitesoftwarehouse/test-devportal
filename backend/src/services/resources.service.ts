import { getRepository } from 'typeorm';
import { Resource } from '../entities/Resource';
import { ResourceCv } from '../entities/ResourceCv';

export interface ResourceCvDTO {
  id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDetailDTO {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  email: string;
  cvs: ResourceCvDTO[];
}

export interface ResourceCvAssociation {
  id: string;
  fileName: string;
  mimeType: string | null;
  storagePath: string;
}

export class ResourcesService {
  private resourceRepository = getRepository(Resource);
  private resourceCvRepository = getRepository(ResourceCv);

  async getResourceDetailWithCvs(resourceId: string): Promise<ResourceDetailDTO | null> {
    const resource = await this.resourceRepository.findOne(resourceId, {
      relations: ['cvs'],
    });

    if (!resource) {
      return null;
    }

    const cvs: ResourceCvDTO[] = (resource.cvs || []).map((cv) => ({
      id: cv.id,
      fileName: cv.fileName,
      createdAt: cv.createdAt.toISOString(),
      updatedAt: cv.updatedAt.toISOString(),
    }));

    const dto: ResourceDetailDTO = {
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      role: resource.role || null,
      email: resource.email,
      cvs,
    };

    return dto;
  }

  async getResourceCvAssociation(resourceId: string, cvId: string): Promise<ResourceCvAssociation | null> {
    const cv = await this.resourceCvRepository.findOne({
      where: { id: cvId, resource: { id: resourceId } },
      relations: ['resource'],
    });

    if (!cv) {
      return null;
    }

    return {
      id: cv.id,
      fileName: cv.fileName,
      mimeType: cv.mimeType || null,
      storagePath: cv.storagePath,
    };
  }
}
