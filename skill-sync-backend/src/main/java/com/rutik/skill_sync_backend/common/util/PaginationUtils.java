package com.rutik.skill_sync_backend.common.util;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public class PaginationUtils {

    public static Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Set<String> allowedSortFields,
            String defaultSortField
    ) {
        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new BadRequestException("Page size must be greater than zero");
        }
        if (size > 50) {
            throw new BadRequestException("Page size must not be greater than 50");
        }

        String direction = sortDir.toLowerCase();
        if (!direction.equals("asc") && !direction.equals("desc")) {
            throw new BadRequestException("Invalid sort direction: " + sortDir + ". Allowed values are 'asc' or 'desc'");
        }

        String field = defaultSortField;
        if (sortBy != null && !sortBy.isBlank()) {
            if (!allowedSortFields.contains(sortBy)) {
                throw new BadRequestException("Invalid sortBy field: '" + sortBy + "'. Allowed fields are: " + allowedSortFields);
            }
            field = sortBy;
        }

        Sort.Direction sortDirection = direction.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(sortDirection, field));
    }
}
