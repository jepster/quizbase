import { Test, TestingModule } from '@nestjs/testing';
import { PerplexityService } from '../src/service/perplexity.service';

describe('PerplexityService', () => {
    let service: PerplexityService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [PerplexityService],
        }).compile();

        service = module.get<PerplexityService>(PerplexityService);
    });

    afterEach(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hello', () => {
        it('should log a message to the console', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            service.hello();
            expect(consoleSpy).toHaveBeenCalledWith('Hello from PerplexityService!');
            consoleSpy.mockRestore();
        });
    });
});