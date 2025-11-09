export const toISOString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value.toDate) {
      const date = value.toDate();
      return date instanceof Date ? date.toISOString() : null;
  }
  return null;
};

export const mapNewsDoc = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    title: data.title || "",
    subtitle: data.subtitle || "",
    content: data.content || "",
    categoryId: data.categoryId || "",
    categoryName: data.categoryName || "General",
    imageUrl: data.imageUrl || "",
    storagePath: data.storagePath || "",
    author: {
      id: data.authorId || "",
      username: data.authorUsername || "",
      email: data.authorEmail || "",
    },
    status: data.status || "Edición",
    returned: Boolean(data.returned),
    createdAt: toISOString(data.createdAt) || toISOString(data.createdAtIso) || null,
    updatedAt: toISOString(data.updatedAt) || toISOString(data.updatedAtIso) || null,
  };
};
