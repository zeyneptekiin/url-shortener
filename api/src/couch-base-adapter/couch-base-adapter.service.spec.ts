import { Test, TestingModule } from '@nestjs/testing';
import { CouchbaseService } from './couch-base-adapter.service';
import * as couchbase from 'couchbase';

describe('CouchbaseService', () => {
  let service: CouchbaseService;
  let mockCluster: Partial<couchbase.Cluster>;
  let mockBucket: Partial<couchbase.Bucket>;
  let mockCollection: Partial<couchbase.Collection>;

  beforeEach(async () => {
    mockCollection = {
      upsert: jest.fn().mockResolvedValue({}),
    };

    mockBucket = {
      defaultCollection: jest.fn().mockReturnValue(mockCollection),
    };

    mockCluster = {
      bucket: jest.fn().mockReturnValue(mockBucket),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouchbaseService,
        {
          provide: couchbase.Cluster,
          useValue: mockCluster,
        },
      ],
    }).compile();

    service = module.get<CouchbaseService>(CouchbaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize the Couchbase connection successfully', async () => {
      await service.onModuleInit();
      expect(mockCluster.bucket).toHaveBeenCalledWith('your_bucket_name'); // Bu adı doğru bucket ile değiştirin
      expect(mockBucket.defaultCollection).toHaveBeenCalled();
    });

    it('should handle errors during initialization', async () => {
      mockCluster.bucket = jest.fn().mockImplementation(() => {
        throw new Error('Connection error');
      });

      await expect(service.onModuleInit()).rejects.toThrow('Connection error');
    });
  });
});
