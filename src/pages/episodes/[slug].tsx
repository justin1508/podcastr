import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps, GetStaticPaths } from 'next';
import { api } from '../../services/api';
import Image from 'next/image';
import Link from 'next/link';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { useRouter } from 'next/router';
import { usePlayer } from '../../contexts/PlayerContext';
import React from 'react';
import Head from 'next/head';

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter();
  const { play } = usePlayer();

  if (router.isFallback) {
    return <p>Carregando</p>
  }
  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar Episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }}>
      </div>

    </div >
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24,
  }
}