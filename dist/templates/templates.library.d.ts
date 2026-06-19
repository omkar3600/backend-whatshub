export declare const PRE_APPROVED_TEMPLATES: ({
    id: string;
    name: string;
    industry: string;
    templateName: string;
    category: string;
    subCategory: string;
    language: string;
    headerType: string;
    headerText: string;
    bodyText: string;
    footerText: string;
    buttons: {
        type: string;
        text: string;
        url: string;
    }[];
    sampleValues: string[];
} | {
    id: string;
    name: string;
    industry: string;
    templateName: string;
    category: string;
    language: string;
    headerType: string;
    headerText: string;
    bodyText: string;
    footerText: string;
    buttons: {
        type: string;
        text: string;
        phone_number: string;
    }[];
    sampleValues: string[];
    subCategory?: undefined;
} | {
    id: string;
    name: string;
    industry: string;
    templateName: string;
    category: string;
    language: string;
    headerType: string;
    headerText: string;
    bodyText: string;
    footerText: string;
    buttons: ({
        type: string;
        text: string;
        url: string;
    } | {
        type: string;
        text: string;
        url?: undefined;
    })[];
    sampleValues: string[];
    subCategory?: undefined;
})[];
