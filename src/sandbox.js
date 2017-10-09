const log = console.log;

function *count()
{
    let start = 3;
    while(true)
    {
        yield start;
        start--;
        if(start === 0)
        {
            return start;
        }
    }
}

const gen = count();
log(gen.next().value);
log(gen.next().value);
log(gen.next().value);
log(gen.next());
log(gen.next());