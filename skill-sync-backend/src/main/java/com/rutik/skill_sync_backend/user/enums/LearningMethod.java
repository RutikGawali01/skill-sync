package com.rutik.skill_sync_backend.user.enums;

public enum LearningMethod {
    VISUAL(Category.PREFERENCE),
    HANDS_ON(Category.PREFERENCE),
    READING(Category.PREFERENCE),
    PROJECT_BASED(Category.PREFERENCE),
    COLLABORATIVE(Category.PREFERENCE),

    VIDEO_CALL(Category.SESSION),
    SCREEN_SHARING(Category.SESSION),
    CODE_REVIEW(Category.SESSION),
    ASYNCHRONOUS(Category.SESSION);

    private final Category category;

    LearningMethod(Category category) {
        this.category = category;
    }

    public Category getCategory() {
        return category;
    }

    public enum Category {
        PREFERENCE,
        SESSION
    }
}