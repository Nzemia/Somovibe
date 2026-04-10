export const MATERIAL_TYPE_CONFIG = {
    PDF: {
        label: "PDF Document",
        icon: "📄",
        color: "bg-blue-500",
        lightColor: "bg-blue-50 dark:bg-blue-950",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-700 dark:text-blue-300",
    },
    PDF_SLIDES: {
        label: "PDF Slides",
        icon: "📊",
        color: "bg-purple-500",
        lightColor: "bg-purple-50 dark:bg-purple-950",
        borderColor: "border-purple-200 dark:border-purple-800",
        textColor: "text-purple-700 dark:text-purple-300",
    },
    POWERPOINT: {
        label: "PowerPoint",
        icon: "🎯",
        color: "bg-orange-500",
        lightColor: "bg-orange-50 dark:bg-orange-950",
        borderColor: "border-orange-200 dark:border-orange-800",
        textColor: "text-orange-700 dark:text-orange-300",
    },
    CLASS_INSTRUCTIONS: {
        label: "Class Instructions",
        icon: "📋",
        color: "bg-green-500",
        lightColor: "bg-green-50 dark:bg-green-950",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-700 dark:text-green-300",
    },
    SCHEME_OF_WORK: {
        label: "Scheme of Work",
        icon: "📅",
        color: "bg-indigo-500",
        lightColor: "bg-indigo-50 dark:bg-indigo-950",
        borderColor: "border-indigo-200 dark:border-indigo-800",
        textColor: "text-indigo-700 dark:text-indigo-300",
    },
    LESSON_PLAN: {
        label: "Lesson Plan",
        icon: "📝",
        color: "bg-pink-500",
        lightColor: "bg-pink-50 dark:bg-pink-950",
        borderColor: "border-pink-200 dark:border-pink-800",
        textColor: "text-pink-700 dark:text-pink-300",
    },
    EXAM_QUIZ: {
        label: "Exam/Quiz",
        icon: "✍️",
        color: "bg-red-500",
        lightColor: "bg-red-50 dark:bg-red-950",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-700 dark:text-red-300",
    },
} as const;

export type MaterialType = keyof typeof MATERIAL_TYPE_CONFIG;

export function getMaterialTypeConfig(type: string) {
    return MATERIAL_TYPE_CONFIG[type as MaterialType] || MATERIAL_TYPE_CONFIG.PDF;
}
