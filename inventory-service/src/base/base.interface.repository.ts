export interface BaseInterfaceRepository<T> {
  create(dto: T | any): Promise<T>;

  findOneById(id: string, projection?: string): Promise<T>;

  findOneByCondition(condition?: object, projection?: string): Promise<T>;

  findAll(
    condition: object,
    options?: object,
  ): Promise<{ count: number; items: T[] }>;

  update(id: string, dto: Partial<T>): Promise<T>;

  softDelete(id: string): Promise<boolean>;

  permanentlyDelete(id: string): Promise<boolean>;
}