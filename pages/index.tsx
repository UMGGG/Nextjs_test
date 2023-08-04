import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { start } from 'repl';

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		router.push('Log');
	})

	return(
		<h2>시작페이지</h2>
	)
}
