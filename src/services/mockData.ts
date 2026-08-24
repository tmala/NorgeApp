export interface County {
  Fylkesnummer: string;
  Fylkesnavn: string;
  Nettsted?: string;
}

export interface Municipality {
  Kommunenummer: string;
  Kommunenavn: string;
  Fylkesnummer: string;
}

export interface PostalCode {
  Postnummer: string;
  Poststed: string;
  Kommunenummer: string;
  Kategori?: string;
}

export const mockFylker: County[] = [
  { Fylkesnummer: "03", Fylkesnavn: "Oslo", Nettsted: "https://www.oslo.kommune.no/" },
  { Fylkesnummer: "11", Fylkesnavn: "Rogaland", Nettsted: "https://www.rogfk.no/" },
  { Fylkesnummer: "15", Fylkesnavn: "Møre og Romsdal", Nettsted: "https://mrfylke.no/" },
  { Fylkesnummer: "18", Fylkesnavn: "Nordland", Nettsted: "https://www.nfk.no/" },
  { Fylkesnummer: "32", Fylkesnavn: "Akershus", Nettsted: "https://afk.no/" },
  { Fylkesnummer: "34", Fylkesnavn: "Innlandet", Nettsted: "https://innlandetfylke.no/" },
  { Fylkesnummer: "42", Fylkesnavn: "Agder", Nettsted: "https://agderfk.no/" },
  { Fylkesnummer: "46", Fylkesnavn: "Vestland", Nettsted: "https://www.vestlandfylke.no/" },
  { Fylkesnummer: "50", Fylkesnavn: "Trøndelag", Nettsted: "https://www.trondelagfylke.no/" },
  { Fylkesnummer: "55", Fylkesnavn: "Troms", Nettsted: "https://www.tromsfylke.no/" },
  { Fylkesnummer: "56", Fylkesnavn: "Finnmark", Nettsted: "https://www.ffk.no/" }
];

export const mockKommuner: Municipality[] = [
  { Kommunenummer: "0301", Kommunenavn: "Oslo", Fylkesnummer: "03" },
  { Kommunenummer: "1103", Kommunenavn: "Stavanger", Fylkesnummer: "11" },
  { Kommunenummer: "1108", Kommunenavn: "Sandnes", Fylkesnummer: "11" },
  { Kommunenummer: "1507", Kommunenavn: "Ålesund", Fylkesnummer: "15" },
  { Kommunenummer: "1804", Kommunenavn: "Bodø", Fylkesnummer: "18" },
  { Kommunenummer: "1806", Kommunenavn: "Narvik", Fylkesnummer: "18" },
  { Kommunenummer: "3202", Kommunenavn: "Bærum", Fylkesnummer: "32" },
  { Kommunenummer: "3205", Kommunenavn: "Lillestrøm", Fylkesnummer: "32" },
  { Kommunenummer: "3405", Kommunenavn: "Lillehammer", Fylkesnummer: "34" },
  { Kommunenummer: "3407", Kommunenavn: "Gjøvik", Fylkesnummer: "34" },
  { Kommunenummer: "4204", Kommunenavn: "Kristiansand", Fylkesnummer: "42" },
  { Kommunenummer: "4202", Kommunenavn: "Arendal", Fylkesnummer: "42" },
  { Kommunenummer: "4601", Kommunenavn: "Bergen", Fylkesnummer: "46" },
  { Kommunenummer: "4602", Kommunenavn: "Kinn", Fylkesnummer: "46" },
  { Kommunenummer: "5001", Kommunenavn: "Trondheim", Fylkesnummer: "50" },
  { Kommunenummer: "5501", Kommunenavn: "Tromsø", Fylkesnummer: "55" },
  { Kommunenummer: "5601", Kommunenavn: "Alta", Fylkesnummer: "56" }
];

export const mockPostnummer: PostalCode[] = [
  // Oslo (0301)
  { Postnummer: "0001", Poststed: "OSLO", Kommunenummer: "0301", Kategori: "S" },
  { Postnummer: "0150", Poststed: "OSLO", Kommunenummer: "0301", Kategori: "G" },
  { Postnummer: "0350", Poststed: "OSLO", Kommunenummer: "0301", Kategori: "B" },
  { Postnummer: "0580", Poststed: "OSLO", Kommunenummer: "0301", Kategori: "B" },
  { Postnummer: "1281", Poststed: "OSLO", Kommunenummer: "0301", Kategori: "P" },
  // Stavanger (1103)
  { Postnummer: "4005", Poststed: "STAVANGER", Kommunenummer: "1103", Kategori: "B" },
  { Postnummer: "4018", Poststed: "STAVANGER", Kommunenummer: "1103", Kategori: "G" },
  { Postnummer: "4022", Poststed: "STAVANGER", Kommunenummer: "1103", Kategori: "B" },
  // Sandnes (1108)
  { Postnummer: "4306", Poststed: "SANDNES", Kommunenummer: "1108", Kategori: "P" },
  { Postnummer: "4325", Poststed: "SANDNES", Kommunenummer: "1108", Kategori: "B" },
  // Ålesund (1507)
  { Postnummer: "6002", Poststed: "ÅLESUND", Kommunenummer: "1507", Kategori: "G" },
  { Postnummer: "6015", Poststed: "ÅLESUND", Kommunenummer: "1507", Kategori: "B" },
  // Bodø (1804)
  { Postnummer: "8003", Poststed: "BODØ", Kommunenummer: "1804", Kategori: "S" },
  { Postnummer: "8012", Poststed: "BODØ", Kommunenummer: "1804", Kategori: "B" },
  // Narvik (1806)
  { Postnummer: "8514", Poststed: "NARVIK", Kommunenummer: "1806", Kategori: "B" },
  { Postnummer: "8517", Poststed: "NARVIK", Kommunenummer: "1806", Kategori: "P" },
  // Bærum (3202)
  { Postnummer: "1337", Poststed: "SANDVIKA", Kommunenummer: "3202", Kategori: "G" },
  { Postnummer: "1358", Poststed: "JAR", Kommunenummer: "3202", Kategori: "B" },
  { Postnummer: "1368", Poststed: "STABEKK", Kommunenummer: "3202", Kategori: "B" },
  // Lillestrøm (3205)
  { Postnummer: "2000", Poststed: "LILLESTRØM", Kommunenummer: "3205", Kategori: "S" },
  { Postnummer: "2004", Poststed: "LILLESTRØM", Kommunenummer: "3205", Kategori: "B" },
  // Lillehammer (3405)
  { Postnummer: "2609", Poststed: "LILLEHAMMER", Kommunenummer: "3405", Kategori: "G" },
  { Postnummer: "2615", Poststed: "LILLEHAMMER", Kommunenummer: "3405", Kategori: "B" },
  // Gjøvik (3407)
  { Postnummer: "2815", Poststed: "GJØVIK", Kommunenummer: "3407", Kategori: "B" },
  { Postnummer: "2821", Poststed: "GJØVIK", Kommunenummer: "3407", Kategori: "P" },
  // Kristiansand (4204)
  { Postnummer: "4608", Poststed: "KRISTIANSAND S", Kommunenummer: "4204", Kategori: "B" },
  { Postnummer: "4615", Poststed: "KRISTIANSAND S", Kommunenummer: "4204", Kategori: "G" },
  { Postnummer: "4630", Poststed: "KRISTIANSAND S", Kommunenummer: "4204", Kategori: "B" },
  // Arendal (4202)
  { Postnummer: "4836", Poststed: "ARENDAL", Kommunenummer: "4202", Kategori: "S" },
  { Postnummer: "4848", Poststed: "ARENDAL", Kommunenummer: "4202", Kategori: "B" },
  // Bergen (4601)
  { Postnummer: "5003", Poststed: "BERGEN", Kommunenummer: "4601", Kategori: "G" },
  { Postnummer: "5012", Poststed: "BERGEN", Kommunenummer: "4601", Kategori: "B" },
  { Postnummer: "5020", Poststed: "BERGEN", Kommunenummer: "4601", Kategori: "B" },
  { Postnummer: "5258", Poststed: "BLOMSTERDALEN", Kommunenummer: "4601", Kategori: "P" },
  // Kinn (4602)
  { Postnummer: "6700", Poststed: "MÅLØY", Kommunenummer: "4602", Kategori: "B" },
  { Postnummer: "6900", Poststed: "FLORØ", Kommunenummer: "4602", Kategori: "B" },
  // Trondheim (5001)
  { Postnummer: "7004", Poststed: "TRONDHEIM", Kommunenummer: "5001", Kategori: "G" },
  { Postnummer: "7030", Poststed: "TRONDHEIM", Kommunenummer: "5001", Kategori: "B" },
  { Postnummer: "7050", Poststed: "TRONDHEIM", Kommunenummer: "5001", Kategori: "B" },
  // Tromsø (5501)
  { Postnummer: "9008", Poststed: "TROMSØ", Kommunenummer: "5501", Kategori: "G" },
  { Postnummer: "9019", Poststed: "TROMSØ", Kommunenummer: "5501", Kategori: "B" },
  // Alta (5601)
  { Postnummer: "9509", Poststed: "ALTA", Kommunenummer: "5601", Kategori: "B" },
  { Postnummer: "9515", Poststed: "ALTA", Kommunenummer: "5601", Kategori: "P" }
];

export const mockPostnummerKategorier: Record<string, string> = {
  "B": "Bostedsadresser (og gateadresser)",
  "G": "Gateadresser",
  "P": "Postboksadresser",
  "S": "Servicepostnummer"
};
