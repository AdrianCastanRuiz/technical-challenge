import type { TmdbMovie } from "./TmdbMovie"

export type MovieDetailContextValue = {
    data: TmdbMovie | null,
    loading: boolean,
    error: string | null,
    genreVariant: () => string,
    handleAddToWishList: ()=> void,
    inWishlist: boolean


}