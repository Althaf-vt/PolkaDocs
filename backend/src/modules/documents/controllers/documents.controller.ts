import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from '../services/documents.service';
import { DocumentQueryDto } from '../dto/document-query.dto';
import { Document } from '../entities/document.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @CurrentUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Document> {
        return this.documentsService.upload(userId, file);
    }

    @Get()
    async findAll(
        @CurrentUser('id') userId: string,
        @Query() query: DocumentQueryDto,
    ): Promise<PaginatedResult<Document>> {
        return this.documentsService.findAll(userId, query);
    }

    @Get(':id')
    async findById(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Document> {
        return this.documentsService.findById(userId, id);
    }

    @Post(':id/reprocess')
    @HttpCode(HttpStatus.OK)
    async reprocess(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Document> {
        return this.documentsService.reprocess(userId, id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        await this.documentsService.delete(userId, id);
    }
}