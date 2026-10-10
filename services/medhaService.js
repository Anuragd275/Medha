import { parseQueryWithMedha } from '../middleware/geminiCaller.js';

function deduplicateModels(products) {
    const seenModels = new Set();

    return products.filter((item) => {
        // Strip common color variants and brackets to extract base model
        const simplifiedTitle = item.title
            .replace(/\(.*?\)/g, '') // strip brackets like (Ice Silver, 8GB...)
            .replace(/\|.*$/g, '')   // strip marketing taglines after "|"
            .trim()
            .toLowerCase();

        if (seenModels.has(simplifiedTitle)) {
            return false;
        }
        seenModels.add(simplifiedTitle);
        return true;
    });
}


export async function executeMedhaSearch(db, userQuery, page = 1, limit = 20) {
    const parsed = await parseQueryWithMedha(userQuery);

    // 1. Validate that the collection actually exists
    const targetCollection = parsed.collection || 'mobile';

    // 2. Build the filter
    const filter = {
        ...parsed.mongo_filter,
    };

    filter.deal_price = {
        ...filter.deal_price,
        $gt: 0 // Never return zero or negative prices
    };

    if (parsed.search_keyword) {
        filter.$text = { $search: parsed.search_keyword };
    }

    const sort = parsed.mongo_sort && Object.keys(parsed.mongo_sort).length > 0
        ? parsed.mongo_sort
        : { rating: -1 };

    // 3. Query the dynamically routed collection
    const results = await db.collection(targetCollection)
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

    return {
        collection: targetCollection,
        deduplicatedResults: deduplicateModels(results),
        refinement: {
            question: parsed.refinement_question,
            chips: parsed.quick_chips,
        },
    };
}