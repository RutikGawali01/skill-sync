package com.rutik.skill_sync_backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// this pageResponse is used for  avaoiding  Spring's internal Page object
// this pageResponse - sends only neccesary info from page obj that are neccesary in frontend
// this approach is mostly used in real word projects
// <T> - can work for any data  type
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;

//   converts Spring Page --> Page<UserDto>
    public static <T> PageResponse<T> from(Page<T> springPage) {
        return PageResponse.<T>builder()
                .content(springPage.getContent() != null ? new java.util.ArrayList<>(springPage.getContent()) : new java.util.ArrayList<>())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .first(springPage.isFirst())
                .last(springPage.isLast())
                .hasNext(springPage.hasNext())
                .hasPrevious(springPage.hasPrevious())
                .build();
    }

    // This method calculates: totalPages , first , last and many more
    //this is useful when you're not using Spring Data JPA.
    public static <T> PageResponse<T> from(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean first = page == 0;
        boolean last = page >= totalPages - 1 || totalPages == 0;
        boolean hasNext = page < totalPages - 1;
        boolean hasPrevious = page > 0;

        return PageResponse.<T>builder()
                .content(content != null ? new java.util.ArrayList<>(content) : new java.util.ArrayList<>())
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(first)
                .last(last)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .build();
    }
}
